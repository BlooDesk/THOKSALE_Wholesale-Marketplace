'use server'

import { revalidatePath } from 'next/cache'
import { requireUser, type Result } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  buyerNextStatuses, sellerNextStatuses, STATUS_LABELS,
  type OrderStatus,
} from '@/lib/commerce'
import { sanitizeField } from '@/lib/sanitize'

export async function transitionOrder(orderId: string, next: OrderStatus, note?: string): Promise<Result> {
  const ctx = await requireUser()
  if (!ctx.ok) return { ok: false, error: 'Not authenticated.' }

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('id, order_number, buyer_id, seller_id, status')
    .eq('id', orderId).maybeSingle()
  if (!order) return { ok: false, error: 'Order not found.' }

  const isBuyer = order.buyer_id === ctx.user.id
  const isSeller = order.seller_id === ctx.user.id
  if (!isBuyer && !isSeller) return { ok: false, error: 'Not authorised.' }

  const allowed = isSeller ? sellerNextStatuses(order.status as OrderStatus) : buyerNextStatuses(order.status as OrderStatus)
  if (!allowed.includes(next)) return { ok: false, error: `Cannot move to ${STATUS_LABELS[next]} from ${STATUS_LABELS[order.status as OrderStatus]}.` }

  const sanitizedNote = sanitizeField(note, 2000)
  const patch: Record<string, unknown> = { status: next }
  if (next === 'cancelled') { patch.cancelled_at = new Date().toISOString(); patch.cancellation_reason = sanitizedNote || null }
  if (next === 'delivered') { patch.delivered_at = new Date().toISOString() }

  const { error } = await admin.from('orders').update(patch).eq('id', order.id)
  if (error) return { ok: false, error: error.message }

  // Notify the other party
  const otherUserId = isSeller ? order.buyer_id : order.seller_id
  try {
    await admin.from('notifications').insert({
      user_id: otherUserId,
      type: 'order_status_update',
      title: `Order ${order.order_number} → ${STATUS_LABELS[next]}`,
      body: sanitizedNote || null,
      data: { order_id: order.id, order_number: order.order_number, status: next },
    })
  } catch {}

  revalidatePath(`/orders/${order.id}`)
  revalidatePath(`/seller/orders/${order.id}`)
  revalidatePath('/orders')
  revalidatePath('/seller/orders')
  return { ok: true }
}
