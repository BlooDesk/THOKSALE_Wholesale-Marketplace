'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeLine, checkCodeUsable, type PartnerCode } from '@/lib/commerce'
import type { Result } from '@/lib/auth-helpers'

export type ShippingAddress = {
  full_name: string
  phone: string
  email?: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  notes?: string
}

function validateAddress(a: ShippingAddress): string | null {
  if (!a.full_name?.trim()) return 'Full name is required.'
  if (!a.phone?.trim()) return 'Phone is required.'
  if (!a.line1?.trim()) return 'Address line 1 is required.'
  if (!a.city?.trim()) return 'City is required.'
  if (!a.state?.trim()) return 'State is required.'
  if (!a.postal_code?.trim()) return 'Postal code is required.'
  if (!a.country?.trim()) return 'Country is required.'
  return null
}

export async function createOrderFromCart(cartId: string, shipping: ShippingAddress): Promise<Result<{ orderId: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Please sign in.' }

  const err = validateAddress(shipping)
  if (err) return { ok: false, error: err }

  const admin = createAdminClient()

  // Load cart with items + products
  const { data: cart } = await admin
    .from('carts')
    .select('id, buyer_id, seller_id, partner_code_id, currency, is_active')
    .eq('id', cartId).maybeSingle()
  if (!cart || cart.buyer_id !== user.id || !cart.is_active) return { ok: false, error: 'Cart not found.' }

  const { data: items } = await admin
    .from('cart_items')
    .select('id, product_id, quantity, products!inner(id, name, sku, base_price, moq, stock_quantity, seller_id, category_id, status, tax_rate)')
    .eq('cart_id', cart.id)
  if (!items || items.length === 0) return { ok: false, error: 'Cart is empty.' }

  // Load partner code if any
  let code: PartnerCode | null = null
  if (cart.partner_code_id) {
    const { data: c } = await admin.from('partner_codes').select('*').eq('id', cart.partner_code_id).maybeSingle()
    const check = checkCodeUsable(c as PartnerCode | null, cart.buyer_id, cart.seller_id)
    code = check.ok ? check.code : null
  }

  // Validate MOQ / stock / status per item
  for (const it of items) {
    const p = (it as Record<string, unknown>).products as Record<string, unknown>
    if (p.status !== 'active') return { ok: false, error: `"${p.name}" is no longer available.` }
    if (it.quantity < (p.moq as number)) return { ok: false, error: `"${p.name}" requires MOQ ${p.moq}.` }
    if (it.quantity > (p.stock_quantity as number)) return { ok: false, error: `"${p.name}" only has ${p.stock_quantity} in stock.` }
  }

  // Compute totals (H5: properly subtract discounts)
  let subtotal = 0, discount = 0, tax = 0
  const orderItemRows: Array<Record<string, unknown>> = []
  for (const it of items) {
    const p = (it as Record<string, unknown>).products as Record<string, unknown>
    const line = computeLine({ basePrice: Number(p.base_price), quantity: it.quantity, product: p as { id: string; category_id: string | null; seller_id: string }, code })
    const perUnitDiscount = line.pricingSource === 'partner' ? Math.max(0, Number(p.base_price) - line.unitPrice) : 0
    const lineTax = Math.round(((line.subtotal * Number(p.tax_rate || 0)) / 100) * 100) / 100
    subtotal += line.subtotal
    discount += perUnitDiscount * it.quantity
    tax += lineTax
    orderItemRows.push({
      product_id: p.id,
      product_name: p.name,
      sku: p.sku,
      quantity: it.quantity,
      unit_price: line.unitPrice,
      discount: perUnitDiscount * it.quantity,
      tax_rate: Number(p.tax_rate || 0),
      tax_amount: lineTax,
      subtotal: line.subtotal + lineTax,
      metadata: { pricing_source: line.pricingSource, tier: line.tierLabel },
    })
  }
  // H5: grand total properly accounts for discounts
  const grand = Math.round((subtotal - discount + tax) * 100) / 100

  if (code?.min_order_amount && subtotal < Number(code.min_order_amount)) {
    return { ok: false, error: `Partner code requires a minimum subtotal of ${code.min_order_amount}.` }
  }

  // Buyer + seller company links
  const [{ data: buyerComp }, { data: sellerComp }] = await Promise.all([
    admin.from('company_profiles').select('id').eq('profile_id', cart.buyer_id).maybeSingle(),
    admin.from('company_profiles').select('id').eq('profile_id', cart.seller_id).maybeSingle(),
  ])

  // Insert order (C3: use correct enum value 'pending')
  const { data: order, error } = await admin.from('orders').insert({
    buyer_id: cart.buyer_id,
    seller_id: cart.seller_id,
    buyer_company_id: buyerComp?.id || null,
    seller_company_id: sellerComp?.id || null,
    partner_code_id: cart.partner_code_id || null,
    status: 'pending',
    payment_status: 'pending',
    currency: cart.currency,
    subtotal,
    discount_total: discount,
    tax_total: tax,
    grand_total: grand,
    shipping_address: shipping as unknown as Record<string, unknown>,
    billing_address: shipping as unknown as Record<string, unknown>,
    metadata: {
      pricing_summary: code ? { method: 'partner', code: code.code } : { method: 'dynamic' },
    },
  }).select('id, order_number').single()

  if (error || !order) return { ok: false, error: error?.message || 'Order creation failed.' }

  const rows = orderItemRows.map((r) => ({ ...r, order_id: order.id }))
  const { error: itemsErr } = await admin.from('order_items').insert(rows)
  if (itemsErr) {
    await admin.from('orders').delete().eq('id', order.id)
    return { ok: false, error: itemsErr.message }
  }

  // C6: Atomic partner code usage increment
  if (code) {
    await admin.rpc('increment_partner_code_usage', { code_id: code.id })
  }

  // C2: Atomic stock decrement — rollback order if any item fails
  for (const r of orderItemRows) {
    const { data: success } = await admin.rpc('decrement_stock', {
      p_id: r.product_id as string,
      q: r.quantity as number,
    })
    if (!success) {
      // Stock was insufficient (race condition caught) — rollback
      await admin.from('order_items').delete().eq('order_id', order.id)
      await admin.from('orders').delete().eq('id', order.id)
      return { ok: false, error: `Stock unavailable for one or more items. Please try again.` }
    }
  }

  // Close cart
  await admin.from('carts').update({ is_active: false, deleted_at: new Date().toISOString() }).eq('id', cart.id)

  // Notification for seller
  try {
    await admin.from('notifications').insert({
      user_id: cart.seller_id,
      type: 'order_created',
      title: 'New order received',
      body: `Order ${order.order_number} — ${cart.currency} ${grand.toLocaleString()}`,
      data: { order_id: order.id, order_number: order.order_number },
    })
  } catch {}

  revalidatePath('/orders')
  revalidatePath('/seller/orders')
  return { ok: true, data: { orderId: order.id } }
}
