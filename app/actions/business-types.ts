'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorised' }
  const { data: profile } = await supabase.from('profiles').select('role, is_active').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin' || !profile?.is_active) return { ok: false as const, error: 'Admin only' }
  return { ok: true as const, supabase }
}

export type BusinessTypeInput = {
  code: string
  name: string
  description?: string
  sort_order?: number
  is_active?: boolean
}

export async function createBusinessType(input: BusinessTypeInput) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx
  const { data, error } = await ctx.supabase.from('business_types').insert({
    code: input.code.trim().toLowerCase(),
    name: input.name.trim(),
    description: input.description || null,
    sort_order: input.sort_order ?? 0,
    is_active: input.is_active ?? true,
  }).select('id').single()
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/business-types')
  return { ok: true as const, data }
}

export async function updateBusinessType(id: string, input: Partial<BusinessTypeInput>) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx
  const patch: any = {}
  if (input.code !== undefined)        patch.code = input.code.trim().toLowerCase()
  if (input.name !== undefined)        patch.name = input.name.trim()
  if (input.description !== undefined) patch.description = input.description || null
  if (input.sort_order !== undefined)  patch.sort_order = input.sort_order
  if (input.is_active !== undefined)   patch.is_active = input.is_active
  const { error } = await ctx.supabase.from('business_types').update(patch).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/business-types')
  return { ok: true as const }
}

export async function toggleBusinessType(id: string, is_active: boolean) { return updateBusinessType(id, { is_active }) }

export async function deleteBusinessType(id: string) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx
  const { error } = await ctx.supabase.from('business_types').update({ deleted_at: new Date().toISOString(), is_active: false }).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/business-types')
  return { ok: true as const }
}
