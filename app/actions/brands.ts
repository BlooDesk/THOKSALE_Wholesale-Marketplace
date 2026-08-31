'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorised' }
  const { data: profile } = await supabase.from('profiles').select('role, is_active').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin' || !profile?.is_active) return { ok: false as const, error: 'Admin only' }
  return { ok: true as const, supabase, userId: user.id }
}
function slugify(v: string) { return v.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80) }

export type BrandInput = {
  name: string
  slug?: string
  brand_type?: 'global' | 'seller' | 'oem' | 'private_label'
  seller_id?: string | null
  logo_url?: string
  description?: string
  country?: string
  website?: string
  is_active?: boolean
  is_verified?: boolean
}

export async function createBrand(input: BrandInput) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx
  const slug = input.slug ? slugify(input.slug) : slugify(input.name)
  const { data, error } = await ctx.supabase.from('brands').insert({
    name: input.name.trim(),
    slug,
    brand_type: input.brand_type || 'global',
    seller_id: input.seller_id || null,
    logo_url: input.logo_url || null,
    description: input.description || null,
    country: input.country || null,
    website: input.website || null,
    is_active: input.is_active ?? true,
    is_verified: input.is_verified ?? false,
  }).select('id').single()
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/brands')
  return { ok: true as const, data }
}

export async function updateBrand(id: string, input: Partial<BrandInput>) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx
  const patch: any = {}
  for (const k of ['name','description','country','website','logo_url','brand_type'] as const) {
    if (input[k] !== undefined) patch[k] = (input as any)[k] || null
  }
  if (input.name) patch.name = input.name.trim()
  if (input.slug !== undefined) patch.slug = slugify(input.slug)
  if (input.seller_id !== undefined) patch.seller_id = input.seller_id || null
  if (input.is_active !== undefined) patch.is_active = input.is_active
  if (input.is_verified !== undefined) patch.is_verified = input.is_verified
  const { error } = await ctx.supabase.from('brands').update(patch).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/brands')
  return { ok: true as const }
}

export async function toggleBrand(id: string, is_active: boolean) { return updateBrand(id, { is_active }) }
export async function verifyBrand(id: string, is_verified: boolean) { return updateBrand(id, { is_verified }) }

export async function deleteBrand(id: string) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx
  const { error } = await ctx.supabase.from('brands').update({ deleted_at: new Date().toISOString(), is_active: false }).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/brands')
  return { ok: true as const }
}
