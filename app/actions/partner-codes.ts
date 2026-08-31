'use server'

import { revalidatePath } from 'next/cache'
import { requireSeller } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkCodeUsable, type PartnerCode } from '@/lib/commerce'
import type { Result } from '@/lib/auth-helpers'

export type CodeInput = {
  id?: string
  code: string
  discount_type: 'percentage' | 'flat' | 'fixed_price'
  discount_value: number
  product_id?: string | null
  category_id?: string | null
  buyer_id?: string | null       // could be an email that we resolve to profile id
  min_order_amount?: number | null
  min_quantity?: number | null
  max_uses?: number | null
  valid_from?: string | null
  valid_until?: string | null
  is_active: boolean
  notes?: string | null
}

function validate(i: CodeInput): string | null {
  if (!i.code || i.code.trim().length < 3) return 'Code must be at least 3 characters.'
  if (!['percentage', 'flat', 'fixed_price'].includes(i.discount_type)) return 'Invalid discount type.'
  if (!(i.discount_value >= 0)) return 'Discount value must be ≥ 0.'
  if (i.discount_type === 'percentage' && i.discount_value > 100) return 'Percentage cannot exceed 100.'
  if (i.product_id && i.category_id) return 'Choose either a product OR a category, not both.'
  return null
}

async function resolveBuyerId(admin: ReturnType<typeof createAdminClient>, hint: string | null | undefined): Promise<string | null> {
  if (!hint) return null
  // If UUID-shaped, treat as id; else treat as email
  if (/^[0-9a-f-]{36}$/i.test(hint)) return hint
  const { data } = await admin.from('profiles').select('id').eq('email', hint.toLowerCase()).maybeSingle()
  return data?.id || null
}

export async function createPartnerCode(input: CodeInput): Promise<Result<{ id: string }>> {
  const ctx = await requireSeller()
  if (!ctx.ok) return { ok: false, error: 'Only sellers can manage codes.' }
  const err = validate(input)
  if (err) return { ok: false, error: err }

  const buyer_id = await resolveBuyerId(ctx.admin, input.buyer_id)
  if (input.buyer_id && !buyer_id) return { ok: false, error: 'Buyer email not found.' }

  const row = {
    code: input.code.trim().toUpperCase(),
    seller_id: ctx.user.id,
    product_id: input.product_id || null,
    category_id: input.category_id || null,
    buyer_id,
    discount_type: input.discount_type,
    discount_value: input.discount_value,
    min_order_amount: input.min_order_amount ?? 0,
    min_quantity: input.min_quantity ?? 1,
    max_uses: input.max_uses ?? null,
    valid_from: input.valid_from || new Date().toISOString(),
    valid_until: input.valid_until || null,
    is_active: input.is_active,
    notes: input.notes || null,
  }

  const { data, error } = await ctx.admin.from('partner_codes').insert(row).select('id').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/seller/partner-codes')
  return { ok: true, data: { id: data.id } }
}

export async function updatePartnerCode(id: string, input: CodeInput): Promise<Result> {
  const ctx = await requireSeller()
  if (!ctx.ok) return { ok: false, error: 'Only sellers can manage codes.' }
  const err = validate(input)
  if (err) return { ok: false, error: err }

  const { data: existing } = await ctx.admin.from('partner_codes').select('seller_id').eq('id', id).maybeSingle()
  if (!existing) return { ok: false, error: 'Code not found.' }
  if (existing.seller_id !== ctx.user.id) return { ok: false, error: 'Not your code.' }

  const buyer_id = await resolveBuyerId(ctx.admin, input.buyer_id)
  if (input.buyer_id && !buyer_id) return { ok: false, error: 'Buyer email not found.' }

  const patch = {
    code: input.code.trim().toUpperCase(),
    product_id: input.product_id || null,
    category_id: input.category_id || null,
    buyer_id,
    discount_type: input.discount_type,
    discount_value: input.discount_value,
    min_order_amount: input.min_order_amount ?? 0,
    min_quantity: input.min_quantity ?? 1,
    max_uses: input.max_uses ?? null,
    valid_from: input.valid_from || new Date().toISOString(),
    valid_until: input.valid_until || null,
    is_active: input.is_active,
    notes: input.notes || null,
  }

  const { error } = await ctx.admin.from('partner_codes').update(patch).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/seller/partner-codes')
  return { ok: true }
}

export async function deletePartnerCode(id: string): Promise<Result> {
  const ctx = await requireSeller()
  if (!ctx.ok) return { ok: false, error: 'Only sellers can manage codes.' }

  const { data: existing } = await ctx.admin.from('partner_codes').select('seller_id').eq('id', id).maybeSingle()
  if (!existing) return { ok: false, error: 'Code not found.' }
  if (existing.seller_id !== ctx.user.id) return { ok: false, error: 'Not your code.' }

  await ctx.admin.from('partner_codes').update({ deleted_at: new Date().toISOString(), is_active: false }).eq('id', id)
  revalidatePath('/seller/partner-codes')
  return { ok: true }
}

/**
 * Buyer-facing validation. Returns the code object if usable for this buyer
 * against the given seller’s catalog.
 */
export async function lookupPartnerCode(codeString: string, sellerId: string): Promise<Result<PartnerCode>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Please sign in to apply a code.' }

  const admin = createAdminClient()
  const { data: code } = await admin
    .from('partner_codes')
    .select('*')
    .eq('code', codeString.trim().toUpperCase())
    .maybeSingle()

  const check = checkCodeUsable(code as any, user.id, sellerId)
  if (!check.ok) return { ok: false, error: check.error }
  return { ok: true, data: check.code }
}
