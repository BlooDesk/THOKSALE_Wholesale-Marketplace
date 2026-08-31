'use server'

import { revalidatePath } from 'next/cache'
import { requireUser, requireSeller, requireBuyer, type Result } from '@/lib/auth-helpers'
import { sanitizeField } from '@/lib/sanitize'

export type CreateRfqInput = {
  title: string
  category?: string
  industry_id?: string
  category_id?: string
  quantity: number
  unit: string
  target_price?: number
  delivery_pincode: string
  specifications?: string
  needed_by?: string
  sample_required?: boolean
  nda_required?: boolean
  payment_terms?: string
}

export async function createRfq(input: CreateRfqInput): Promise<Result<{ id: string }>> {
  const ctx = await requireUser(); if (!ctx.ok) return { ok: false, error: 'Not authenticated.' }
  if (!input.title?.trim()) return { ok: false, error: 'Title is required.' }
  if (!input.quantity || input.quantity <= 0) return { ok: false, error: 'Quantity must be > 0.' }
  if (!input.unit?.trim()) return { ok: false, error: 'Unit is required.' }
  if (!input.delivery_pincode?.trim()) return { ok: false, error: 'Delivery PIN code is required.' }

  const pin = input.delivery_pincode.replace(/\D/g, '').slice(0, 6)
  if (pin.length !== 6) return { ok: false, error: 'PIN code must be 6 digits.' }

  const num = `RFQ-${Date.now().toString(36).toUpperCase()}`

  const { data, error } = await ctx.admin.from('rfqs').insert({
    rfq_number: num,
    buyer_id: ctx.user.id,
    title: sanitizeField(input.title, 200) || input.title.trim(),
    industry_id: input.industry_id || null,
    category_id: input.category_id || null,
    category: input.category || null,
    quantity: input.quantity,
    unit: sanitizeField(input.unit, 30) || 'units',
    target_price: input.target_price ?? null,
    delivery_pincode: pin,
    specifications: sanitizeField(input.specifications, 4000),
    needed_by: input.needed_by || null,
    sample_required: input.sample_required ?? false,
    nda_required: input.nda_required ?? false,
    payment_terms: sanitizeField(input.payment_terms, 1000),
    status: 'open',
  }).select('id').single()

  if (error || !data) return { ok: false, error: error?.message || 'Failed to create RFQ.' }

  revalidatePath('/rfq')
  revalidatePath('/seller/rfq')
  return { ok: true, data: { id: data.id } }
}

export type SubmitQuoteInput = {
  rfq_id: string
  quoted_price: number
  quantity_available?: number
  lead_time_days?: number
  validity_days?: number
  payment_terms?: string
  notes?: string
}

export async function submitRfqQuote(input: SubmitQuoteInput): Promise<Result<{ id: string }>> {
  const ctx = await requireSeller(); if (!ctx.ok) return { ok: false, error: ctx.error }
  if (!input.quoted_price || input.quoted_price <= 0) return { ok: false, error: 'Quoted price must be > 0.' }

  const { data: rfq } = await ctx.admin.from('rfqs').select('id, rfq_number, buyer_id, status').eq('id', input.rfq_id).maybeSingle()
  if (!rfq) return { ok: false, error: 'RFQ not found.' }
  if (rfq.status !== 'open' && rfq.status !== 'quoted') return { ok: false, error: 'RFQ is closed to quotes.' }

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
  try {
    await ctx.admin.from('notifications').insert({
      user_id: rfq.buyer_id, type: 'rfq_response',
      title: `New quote on RFQ ${rfq.rfq_number}`,
      data: { rfq_id: rfq.id, rfq_number: rfq.rfq_number, response_id: data.id },
    })
  } catch {}

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

  try {
    await ctx.admin.from('notifications').insert({
      user_id: resp.seller_id, type: 'rfq_response',
      title: `Your quote on RFQ ${rfqData.rfq_number} was accepted!`,
      data: { rfq_id: resp.rfq_id, response_id: resp.id },
    })
  } catch {}

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
