'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireBuyer, type Result } from '@/lib/auth-helpers'
import { computeLine, checkCodeUsable, type PartnerCode } from '@/lib/commerce'

/**
 * Re-compute all line prices on a cart, applying partner code if any.
 * Persists updated unit_price + discount + subtotal on each cart_item.
 */
async function recomputeCart(admin: ReturnType<typeof createAdminClient>, cartId: string) {
  const { data: cart } = await admin
    .from('carts')
    .select('id, buyer_id, seller_id, partner_code_id')
    .eq('id', cartId).maybeSingle()
  if (!cart) return

  let code: PartnerCode | null = null
  if (cart.partner_code_id) {
    const { data: c } = await admin.from('partner_codes').select('*').eq('id', cart.partner_code_id).maybeSingle()
    if (c) {
      const check = checkCodeUsable(c as PartnerCode | null, cart.buyer_id, cart.seller_id)
      code = check.ok ? check.code : null
      if (!check.ok) {
        await admin.from('carts').update({ partner_code_id: null }).eq('id', cart.id)
      }
    }
  }

  const { data: items } = await admin
    .from('cart_items')
    .select('id, product_id, quantity, products!inner(id, base_price, category_id, seller_id)')
    .eq('cart_id', cart.id)

  for (const it of items || []) {
    const p = (it as Record<string, unknown>).products as { id: string; base_price: number; category_id: string | null; seller_id: string }
    if (!p) continue
    const line = computeLine({ basePrice: Number(p.base_price), quantity: it.quantity, product: p, code })
    const discountPerUnit = line.pricingSource === 'partner' ? Math.max(0, Number(p.base_price) - line.unitPrice) : 0
    await admin.from('cart_items').update({
      unit_price: line.unitPrice,
      discount: discountPerUnit * it.quantity,
    }).eq('id', it.id)
  }
}

export async function addToCart(productId: string, quantity: number): Promise<Result<{ cartId: string }>> {
  const ctx = await requireBuyer()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  // M12: filter deleted products at the DB level
  const { data: product } = await ctx.admin
    .from('products')
    .select('id, seller_id, base_price, moq, stock_quantity, status, deleted_at, currency, category_id')
    .eq('id', productId)
    .is('deleted_at', null)
    .maybeSingle()
  if (!product) return { ok: false, error: 'Product not found.' }
  if (product.status !== 'active') return { ok: false, error: 'Product is not available.' }
  const qty = Math.max(1, Math.floor(quantity))
  if (qty < product.moq) return { ok: false, error: `Minimum order is ${product.moq}.` }
  if (qty > product.stock_quantity) return { ok: false, error: `Only ${product.stock_quantity} in stock.` }

  // Find or create active cart for (buyer, seller)
  let { data: cart } = await ctx.admin
    .from('carts').select('id')
    .eq('buyer_id', ctx.user.id).eq('seller_id', product.seller_id).eq('is_active', true).is('deleted_at', null)
    .maybeSingle()

  if (!cart) {
    const { data: newCart, error } = await ctx.admin.from('carts').insert({
      buyer_id: ctx.user.id, seller_id: product.seller_id, currency: product.currency || 'INR', is_active: true,
    }).select('id').single()
    if (error || !newCart) return { ok: false, error: error?.message || 'Cart creation failed.' }
    cart = newCart
  }

  // Upsert cart_item (increment quantity if exists)
  const { data: existingItem } = await ctx.admin
    .from('cart_items').select('id, quantity').eq('cart_id', cart.id).eq('product_id', product.id).maybeSingle()

  if (existingItem) {
    const newQty = Math.min(product.stock_quantity, existingItem.quantity + qty)
    await ctx.admin.from('cart_items').update({ quantity: newQty, unit_price: Number(product.base_price) }).eq('id', existingItem.id)
  } else {
    await ctx.admin.from('cart_items').insert({
      cart_id: cart.id, product_id: product.id, quantity: qty, unit_price: Number(product.base_price),
    })
  }

  await recomputeCart(ctx.admin, cart.id)
  revalidatePath('/cart')
  return { ok: true, data: { cartId: cart.id } }
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Result> {
  const ctx = await requireBuyer()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const { data: item } = await ctx.admin
    .from('cart_items')
    .select('id, cart_id, quantity, products!inner(id, base_price, moq, stock_quantity, seller_id, category_id), carts!inner(buyer_id)')
    .eq('id', itemId).maybeSingle()
  if (!item) return { ok: false, error: 'Item not found.' }

  const cartData = (item as Record<string, unknown>).carts as { buyer_id: string }
  if (cartData.buyer_id !== ctx.user.id) return { ok: false, error: 'Not your item.' }

  const p = (item as Record<string, unknown>).products as { moq: number; stock_quantity: number }
  const qty = Math.max(1, Math.floor(quantity))
  if (qty < p.moq) return { ok: false, error: `Minimum order is ${p.moq}.` }
  if (qty > p.stock_quantity) return { ok: false, error: `Only ${p.stock_quantity} in stock.` }

  await ctx.admin.from('cart_items').update({ quantity: qty }).eq('id', item.id)
  await recomputeCart(ctx.admin, item.cart_id)
  revalidatePath('/cart')
  return { ok: true }
}

export async function removeCartItem(itemId: string): Promise<Result> {
  const ctx = await requireBuyer()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const { data: item } = await ctx.admin
    .from('cart_items').select('id, cart_id, carts!inner(buyer_id)').eq('id', itemId).maybeSingle()
  if (!item) return { ok: false, error: 'Item not found.' }

  const cartData = (item as Record<string, unknown>).carts as { buyer_id: string }
  if (cartData.buyer_id !== ctx.user.id) return { ok: false, error: 'Not your item.' }

  await ctx.admin.from('cart_items').delete().eq('id', item.id)
  await recomputeCart(ctx.admin, item.cart_id)
  revalidatePath('/cart')
  return { ok: true }
}

export async function applyCodeToCart(cartId: string, codeString: string): Promise<Result<{ applied: boolean; error?: string }>> {
  const ctx = await requireBuyer()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const { data: cart } = await ctx.admin.from('carts').select('id, seller_id, buyer_id').eq('id', cartId).maybeSingle()
  if (!cart || cart.buyer_id !== ctx.user.id) return { ok: false, error: 'Cart not found.' }

  const { data: code } = await ctx.admin.from('partner_codes').select('*').eq('code', codeString.trim().toUpperCase()).maybeSingle()
  const check = checkCodeUsable(code as PartnerCode | null, ctx.user.id, cart.seller_id)
  if (!check.ok) return { ok: false, error: check.error }

  await ctx.admin.from('carts').update({ partner_code_id: check.code.id }).eq('id', cart.id)
  await recomputeCart(ctx.admin, cart.id)
  revalidatePath('/cart')
  return { ok: true, data: { applied: true } }
}

export async function removeCodeFromCart(cartId: string): Promise<Result> {
  const ctx = await requireBuyer()
  if (!ctx.ok) return { ok: false, error: ctx.error }
  const { data: cart } = await ctx.admin.from('carts').select('id, buyer_id').eq('id', cartId).maybeSingle()
  if (!cart || cart.buyer_id !== ctx.user.id) return { ok: false, error: 'Cart not found.' }
  await ctx.admin.from('carts').update({ partner_code_id: null }).eq('id', cart.id)
  await recomputeCart(ctx.admin, cart.id)
  revalidatePath('/cart')
  return { ok: true }
}

export async function clearCart(cartId: string): Promise<Result> {
  const ctx = await requireBuyer()
  if (!ctx.ok) return { ok: false, error: ctx.error }
  const { data: cart } = await ctx.admin.from('carts').select('id, buyer_id').eq('id', cartId).maybeSingle()
  if (!cart || cart.buyer_id !== ctx.user.id) return { ok: false, error: 'Cart not found.' }
  await ctx.admin.from('cart_items').delete().eq('cart_id', cart.id)
  await ctx.admin.from('carts').update({ is_active: false, deleted_at: new Date().toISOString() }).eq('id', cart.id)
  revalidatePath('/cart')
  return { ok: true }
}
