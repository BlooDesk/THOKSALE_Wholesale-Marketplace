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

function slugify(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

export type IndustryInput = {
  name: string
  slug?: string
  description?: string
  icon_name?: string
  icon_url?: string
  image_url?: string
  sort_order?: number
  is_active?: boolean
}

export async function createIndustry(input: IndustryInput) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx
  const slug = input.slug ? slugify(input.slug) : slugify(input.name)
  const { data, error } = await ctx.supabase.from('industries').insert({
    name: input.name.trim(),
    slug,
    description: input.description || null,
    icon_name: input.icon_name || null,
    icon_url: input.icon_url || null,
    image_url: input.image_url || null,
    sort_order: input.sort_order ?? 0,
    is_active: input.is_active ?? true,
  }).select('id').single()
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/industries')
  revalidatePath('/')
  return { ok: true as const, data }
}

export async function updateIndustry(id: string, input: Partial<IndustryInput>) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx
  const patch: any = {}
  if (input.name !== undefined)        patch.name = input.name.trim()
  if (input.slug !== undefined)        patch.slug = slugify(input.slug)
  if (input.description !== undefined) patch.description = input.description || null
  if (input.icon_name !== undefined)   patch.icon_name = input.icon_name || null
  if (input.icon_url !== undefined)    patch.icon_url = input.icon_url || null
  if (input.image_url !== undefined)   patch.image_url = input.image_url || null
  if (input.sort_order !== undefined)  patch.sort_order = input.sort_order
  if (input.is_active !== undefined)   patch.is_active = input.is_active
  const { error } = await ctx.supabase.from('industries').update(patch).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/industries')
  revalidatePath('/')
  return { ok: true as const }
}

export async function toggleIndustry(id: string, is_active: boolean) {
  return updateIndustry(id, { is_active })
}

export async function deleteIndustry(id: string) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx
  const { error } = await ctx.supabase.from('industries').update({ deleted_at: new Date().toISOString(), is_active: false }).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/industries')
  return { ok: true as const }
}
