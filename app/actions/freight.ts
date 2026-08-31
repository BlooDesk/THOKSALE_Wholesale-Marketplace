'use server'

import { revalidatePath } from 'next/cache'
import { requireUser, type Result } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { STATUS_LABELS, type OrderStatus } from '@/lib/commerce'
import { sanitizeField } from '@/lib/sanitize'

export type FreightQuoteInput = {
  order_id: string
  carrier_name: string
  quoted_amount: number
  transit_days?: number
  tracking_number?: string
  valid_until_days?: number
  notes?: string
}

/**
 * Seller provides a freight quote for an order that is in 'awaiting_freight_quote' (or 'accepted').
 */
export async function provideFreightQuote(input: FreightQuoteInput): Promise<Result> {
  const ctx = await requireUser(); if (!ctx.ok) return { ok: false, error: 'Not authenticated.' }
  if (!input.carrier_name?.trim()) return { ok: false, error: 'Carrier name is required.' }
  if (input.quoted_amount == null || input.quoted_amount < 0) return { ok: false, error: 'Quoted amount must be ≥ 0.' }

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('id, order_number, buyer_id, seller_id, status, subtotal, tax_total, discount_total, currency')
    .eq('id', input.order_id).maybeSingle()
  if (!order) return { ok: false, error: 'Order not found.' }
  if (order.seller_id !== ctx.user.id) return { ok: false, error: 'Not your order.' }

  // H4: Allow quoting from accepted or awaiting_freight_quote
  if (order.status !== 'awaiting_freight_quote' && order.status !== 'accepted') {
    return { ok: false, error: `Cannot quote freight on an order in status: ${order.status}` }
  }

  const validUntil = new Date(Date.now() + (input.valid_until_days || 7) * 86400_000).toISOString()
  const sanitizedNotes = sanitizeField(input.notes, 2000)

  // Insert freight_quotes record
  const { data: fq, error } = await admin.from('freight_quotes').insert({
    order_id: order.id,
    carrier_name: sanitizeField(input.carrier_name, 200) || input.carrier_name.trim(),
    quoted_amount: input.quoted_amount,
    currency: order.currency,
    estimated_days: input.transit_days || null,
    status: 'pending',
    valid_until: validUntil,
    provider_payload: sanitizedNotes ? { notes: sanitizedNotes } : null,
    origin_address: {},
    destination_address: {},
  }).select('id').single()
  if (error || !fq) return { ok: false, error: error?.message || 'Failed to save quote.' }

  // H5: Consistent grand total = subtotal - discount + tax + freight
  const grand = Number(order.subtotal) - Number(order.discount_total || 0) + Number(order.tax_total || 0) + Number(input.quoted_amount)

  // C3: use correct enum value
  await admin.from('orders').update({
    status: 'freight_quote_sent',
    freight_quote_id: fq.id,
    freight_total: input.quoted_amount,
    grand_total: grand,
    estimated_delivery: input.transit_days ? new Date(Date.now() + input.transit_days * 86400_000).toISOString().slice(0, 10) : null,
  }).eq('id', order.id)

  try {
    await admin.from('notifications').insert({
      user_id: order.buyer_id,
      type: 'freight_quote',
      title: `Freight quote received on order ${order.order_number}`,
      body: `${order.currency} ${Number(input.quoted_amount).toLocaleString()} • ${input.transit_days || '?'} days`,
      data: { order_id: order.id, order_number: order.order_number, freight_quote_id: fq.id },
    })
  } catch {}

  revalidatePath(`/orders/${order.id}`)
  revalidatePath('/orders'); revalidatePath('/seller/orders')
  return { ok: true }
}

/** Buyer accepts the pending freight quote. */
export async function acceptFreightQuote(orderId: string): Promise<Result> {
  const ctx = await requireUser(); if (!ctx.ok) return { ok: false, error: 'Not authenticated.' }
  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders').select('id, order_number, buyer_id, seller_id, status, freight_quote_id').eq('id', orderId).maybeSingle()
  if (!order) return { ok: false, error: 'Order not found.' }
  if (order.buyer_id !== ctx.user.id) return { ok: false, error: 'Not your order.' }
  if (order.status !== 'freight_quote_sent') return { ok: false, error: 'No pending freight quote.' }
  if (!order.freight_quote_id) return { ok: false, error: 'Freight quote missing.' }

  await admin.from('freight_quotes').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', order.freight_quote_id)
  // C3: correct enum value
  await admin.from('orders').update({ status: 'freight_approved' }).eq('id', order.id)

  try {
    await admin.from('notifications').insert({
      user_id: order.seller_id,
      type: 'freight_quote',
      title: `Freight approved on order ${order.order_number}`,
      data: { order_id: order.id, order_number: order.order_number },
    })
  } catch {}

  revalidatePath(`/orders/${order.id}`); revalidatePath('/orders'); revalidatePath('/seller/orders')
  return { ok: true }
}

/** Buyer rejects the freight quote — seller may re-quote. */
export async function rejectFreightQuote(orderId: string, reason?: string): Promise<Result> {
  const ctx = await requireUser(); if (!ctx.ok) return { ok: false, error: 'Not authenticated.' }
  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders').select('id, order_number, buyer_id, seller_id, status, freight_quote_id, subtotal, tax_total, discount_total').eq('id', orderId).maybeSingle()
  if (!order) return { ok: false, error: 'Order not found.' }
  if (order.buyer_id !== ctx.user.id) return { ok: false, error: 'Not your order.' }
  if (order.status !== 'freight_quote_sent') return { ok: false, error: 'No pending freight quote.' }

  if (order.freight_quote_id) {
    await admin.from('freight_quotes').update({ status: 'rejected' }).eq('id', order.freight_quote_id)
  }

  // H5: consistent grand total without freight
  const grand = Number(order.subtotal) - Number(order.discount_total || 0) + Number(order.tax_total || 0)
  // C3: correct enum value
  await admin.from('orders').update({
    status: 'awaiting_freight_quote',
    freight_quote_id: null,
    freight_total: 0,
    grand_total: grand,
  }).eq('id', order.id)

  const sanitizedReason = sanitizeField(reason, 2000)
  try {
    await admin.from('notifications').insert({
      user_id: order.seller_id,
      type: 'freight_quote',
      title: `Freight quote rejected on order ${order.order_number}`,
      body: sanitizedReason || null,
      data: { order_id: order.id, order_number: order.order_number, reason: sanitizedReason },
    })
  } catch {}

  revalidatePath(`/orders/${order.id}`); revalidatePath('/orders'); revalidatePath('/seller/orders')
  return { ok: true }
}

/** Seller requests buyer's freight input (moves order to awaiting_freight_quote). */
export async function requestFreightQuote(orderId: string): Promise<Result> {
  const ctx = await requireUser(); if (!ctx.ok) return { ok: false, error: 'Not authenticated.' }
  const admin = createAdminClient()
  const { data: order } = await admin.from('orders').select('id, buyer_id, seller_id, status').eq('id', orderId).maybeSingle()
  if (!order) return { ok: false, error: 'Order not found.' }
  if (order.seller_id !== ctx.user.id) return { ok: false, error: 'Not your order.' }
  if (order.status !== 'accepted') return { ok: false, error: 'Only accepted orders can request a quote.' }

  // C3: correct enum value
  await admin.from('orders').update({ status: 'awaiting_freight_quote' }).eq('id', order.id)
  revalidatePath(`/orders/${order.id}`)
  return { ok: true }
}
