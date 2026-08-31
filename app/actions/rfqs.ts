'use server'

import { revalidatePath } from 'next/cache'
import { requireBuyer, requireSeller, type Result } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { sanitizeField } from '@/lib/sanitize'

export type RfqInput = {
  title: string
  description?: string
  category_id?: string | null
  quantity: number
  unit?: string
  target_price?: number | null
  currency?: string
  delivery_location?: { city?: string; state?: string; country?: string; postal_code?: string }
  delivery_deadline?: string | null
  attachments?: Array<{ name: string; url: string }>
  is_public?: boolean
}

export type ResponseInput = {
  rfqId: string
  quoted_price: number
  quantity_available?: number | null
  lead_time_days?: number | null
  validity_days?: number | null
  payment_terms?: string | null
  notes?: string | null
}

export async function createRfq(input: RfqInput): Promise<Result<{ id: string }>> {
  const ctx = await requireBuyer(); if (!ctx.ok) return { ok: false, error: ctx.error }
  if (!input.title?.trim()) return { ok: false, error: 'Title is required.' }
  if (!Number.isFinite(input.quantity) || input.quantity < 1) return { ok: false, error: 'Quantity must be at least 1.' }

  const { data: buyerComp } = await ctx.admin.from('company_profiles').select('id').eq('profile_id', ctx.user.id).maybeSingle()

  const { data, error } = await ctx.admin.from('rfqs').insert({
    buyer_id: ctx.user.id,
    buyer_company_id: buyerComp?.id || null,
    category_id: input.category_id || null,
    title: sanitizeField(input.title, 200) || input.title.trim(),
    description: sanitizeField(input.description, 5000),
    quantity: Math.floor(input.quantity),
    unit: input.unit || 'piece',
    target_price: input.target_price ?? null,
    currency: input.currency || 'INR',
    delivery_location: input.delivery_location ?? {},
    delivery_deadline: input.delivery_deadline || null,
    attachments: input.attachments || [],
    status: 'open',
    is_public: input.is_public ?? true,
  }).select('id').single()
  if (error || !data) return { ok: false, error: error?.message || 'Failed to create RFQ.' }

  revalidatePath('/rfq'); revalidatePath('/seller/rfq')
  return { ok: true, data: { id: data.id } }
}

export async function closeRfq(id: string): Promise<Result> {
  const ctx = await requireBuyer(); if (!ctx.ok) return { ok: false, error: ctx.error }
  const { data: rfq } = await ctx.admin.from('rfqs').select('buyer_id').eq('id', id).maybeSingle()
  if (!rfq || rfq.buyer_id !== ctx.user.id) return { ok: false, error: 'RFQ not found.' }
  await ctx.admin.from('rfqs').update({ status: 'closed' }).eq('id', id)
  revalidatePath('/rfq'); revalidatePath(`/rfq/${id}`)
  return { ok: true }
}

export async function submitRfqResponse(input: ResponseInput): Promise<Result<{ id: string }>> {
  const ctx = await requireSeller(); if (!ctx.ok) return { ok: false, error: ctx.error }
  if (!(input.quoted_price >= 0)) return { ok: false, error: 'Quoted price must be ≥ 0.' }

  const { data: rfq } = await ctx.admin.from('rfqs').select('id, buyer_id, status, rfq_number, invited_sellers, is_public').eq('id', input.rfqId).maybeSingle()
  if (!rfq) return { ok: false, error: 'RFQ not found.' }
  if (!['open', 'in_review'].includes(rfq.status)) return { ok: false, error: 'RFQ is not open.' }
  const canAccess = rfq.is_public || (rfq.invited_sellers || []).includes(ctx.user.id)
  if (!canAccess) return { ok: false, error: 'You are not invited to this RFQ.' }

  const { data: sellerComp } = await ctx.admin.from('company_profiles').select('id').eq('profile_id', ctx.user.id).maybeSingle()

  const { data, error } = await ctx.admin.from('rfq_responses').upsert({
    rfq_id: rfq.id,
    seller_id: ctx.user.id,
    seller_company_id: sellerComp?.id || null,
    quoted_price: input.quoted_price,
    quantity_available: input.quantity_available ?? null,
    lead_time_days: input.lead_time_days ?? null,
    validity_days: input.validity_days ?? null,
    payment_terms: sanitizeField(input.payment_terms, 1000),
    notes: sanitizeField(input.notes, 2000),
    status: 'submitted',
  }, { onConflict: 'rfq_id,seller_id' }).select('id').single()
  if (error || !data) return { ok: false, error: error?.message || 'Failed to submit.' }

  await ctx.admin.from('rfqs').update({ status: 'quoted' }).eq('id', rfq.id).eq('status', 'open')
  await ctx.admin.from('notifications').insert({
    user_id: rfq.buyer_id, type: 'rfq_response',
    title: `New quote on RFQ ${rfq.rfq_number}`,
    data: { rfq_id: rfq.id, rfq_number: rfq.rfq_number, response_id: data.id },
  }).catch(() => {})

  revalidatePath(`/rfq/${rfq.id}`); revalidatePath('/seller/rfq')
  return { ok: true, data: { id: data.id } }
}

export async function acceptRfqResponse(responseId: string): Promise<Result> {
  const ctx = await requireBuyer(); if (!ctx.ok) return { ok: false, error: ctx.error }
  const { data: resp } = await ctx.admin
    .from('rfq_responses').select('id, rfq_id, seller_id, rfqs!inner(buyer_id, rfq_number)').eq('id', responseId).maybeSingle()
  if (!resp) return { ok: false, error: 'Response not found.' }

  const rfqData = (resp as Record<string, unknown>).rfqs as { buyer_id: string; rfq_number: string }
  if (rfqData.buyer_id !== ctx.user.id) return { ok: false, error: 'Not your RFQ.' }

  await ctx.admin.from('rfq_responses').update({ status: 'rejected' }).eq('rfq_id', resp.rfq_id).neq('id', resp.id)
  await ctx.admin.from('rfq_responses').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', resp.id)
  await ctx.admin.from('rfqs').update({ status: 'accepted' }).eq('id', resp.rfq_id)

  await ctx.admin.from('notifications').insert({
    user_id: resp.seller_id, type: 'rfq_response',
    title: `Your quote on RFQ ${rfqData.rfq_number} was accepted!`,
    data: { rfq_id: resp.rfq_id, response_id: resp.id },
  }).catch(() => {})

  revalidatePath(`/rfq/${resp.rfq_id}`); revalidatePath('/seller/rfq')
  return { ok: true }
}

export async function rejectRfqResponse(responseId: string): Promise<Result> {
  const ctx = await requireBuyer(); if (!ctx.ok) return { ok: false, error: ctx.error }
  const { data: resp } = await ctx.admin
    .from('rfq_responses').select('id, rfq_id, seller_id, rfqs!inner(buyer_id, rfq_number)').eq('id', responseId).maybeSingle()
  if (!resp) return { ok: false, error: 'Response not found.' }

  const rfqData = (resp as Record<string, unknown>).rfqs as { buyer_id: string }
  if (rfqData.buyer_id !== ctx.user.id) return { ok: false, error: 'Not your RFQ.' }

  await ctx.admin.from('rfq_responses').update({ status: 'rejected' }).eq('id', resp.id)
  revalidatePath(`/rfq/${resp.rfq_id}`)
  return { ok: true }
}
