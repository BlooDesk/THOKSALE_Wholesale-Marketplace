'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin, type Result } from '@/lib/auth-helpers'
import { sanitizeField } from '@/lib/sanitize'

export async function toggleUserActive(userId: string): Promise<Result> {
  const ctx = await requireAdmin(); if (!ctx.ok) return { ok: false, error: ctx.error }
  const { data: p } = await ctx.admin.from('profiles').select('is_active').eq('id', userId).maybeSingle()
  if (!p) return { ok: false, error: 'User not found' }
  await ctx.admin.from('profiles').update({ is_active: !p.is_active }).eq('id', userId)
  revalidatePath('/admin/users')
  return { ok: true }
}

export async function verifySellerCompany(profileId: string): Promise<Result> {
  const ctx = await requireAdmin(); if (!ctx.ok) return { ok: false, error: ctx.error }
  await ctx.admin.from('company_profiles').update({ kyc_status: 'verified', verified_at: new Date().toISOString(), verified_by: ctx.user.id }).eq('profile_id', profileId)
  try {
    await ctx.admin.from('notifications').insert({
      user_id: profileId,
      type: 'kyc_status',
      title: 'Your company has been verified',
      data: {},
    })
  } catch {}
  revalidatePath('/admin/users')
  return { ok: true }
}

export async function unverifySellerCompany(profileId: string): Promise<Result> {
  const ctx = await requireAdmin(); if (!ctx.ok) return { ok: false, error: ctx.error }
  await ctx.admin.from('company_profiles').update({ kyc_status: 'pending', verified_at: null, verified_by: null }).eq('profile_id', profileId)
  revalidatePath('/admin/users')
  return { ok: true }
}

export type CategoryInput = { id?: string; parent_id?: string | null; industry_id?: string | null; name: string; slug: string; description?: string | null; sort_order?: number; is_active: boolean }

export async function upsertCategory(input: CategoryInput): Promise<Result<{ id: string }>> {
  const ctx = await requireAdmin(); if (!ctx.ok) return { ok: false, error: ctx.error }
  if (!input.name?.trim() || !input.slug?.trim()) return { ok: false, error: 'Name and slug required.' }
  const row = {
    name: sanitizeField(input.name, 200) || input.name.trim(),
    slug: input.slug.trim().toLowerCase(),
    parent_id: input.parent_id || null,
    industry_id: input.industry_id || null,
    description: sanitizeField(input.description, 2000),
    sort_order: input.sort_order ?? 0,
    is_active: input.is_active,
  }
  let id = input.id
  if (id) {
    const { error } = await ctx.admin.from('categories').update(row).eq('id', id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { data, error } = await ctx.admin.from('categories').insert(row).select('id').single()
    if (error || !data) return { ok: false, error: error?.message || 'Insert failed.' }
    id = data.id
  }
  revalidatePath('/admin/categories'); revalidatePath('/')
  return { ok: true, data: { id: id! } }
}

export async function toggleCategoryActive(id: string): Promise<Result> {
  const ctx = await requireAdmin(); if (!ctx.ok) return { ok: false, error: ctx.error }
  const { data: c } = await ctx.admin.from('categories').select('is_active').eq('id', id).maybeSingle()
  if (!c) return { ok: false, error: 'Not found.' }
  await ctx.admin.from('categories').update({ is_active: !c.is_active }).eq('id', id)
  revalidatePath('/admin/categories'); revalidatePath('/')
  return { ok: true }
}

export async function moderateProduct(id: string, action: 'approve' | 'reject' | 'feature' | 'unfeature' | 'archive'): Promise<Result> {
  const ctx = await requireAdmin(); if (!ctx.ok) return { ok: false, error: ctx.error }
  const patch: Record<string, unknown> = {}
  if (action === 'approve') patch.status = 'active'
  if (action === 'reject') patch.status = 'inactive'
  if (action === 'feature') patch.is_featured = true
  if (action === 'unfeature') patch.is_featured = false
  if (action === 'archive') { patch.status = 'archived'; patch.deleted_at = new Date().toISOString() }
  await ctx.admin.from('products').update(patch).eq('id', id)
  revalidatePath('/admin/products'); revalidatePath('/')
  return { ok: true }
}
