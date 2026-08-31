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
function keyify(v: string) { return v.toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,60) }

export type AttrType = 'text'|'number'|'boolean'|'select'|'multi_select'|'date'|'color'|'dimension'|'weight'|'measurement'|'unit'

export type AttributeInput = {
  category_id: string
  key?: string
  label: string
  attr_type: AttrType
  options?: Array<{ value: string; label: string }>
  unit?: string
  placeholder?: string
  helper_text?: string
  is_required?: boolean
  is_filterable?: boolean
  is_variant?: boolean
  sort_order?: number
  is_active?: boolean
}

export async function createAttribute(input: AttributeInput) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx
  const key = input.key ? keyify(input.key) : keyify(input.label)
  const { data, error } = await ctx.supabase.from('attribute_definitions').insert({
    category_id: input.category_id,
    key,
    label: input.label.trim(),
    attr_type: input.attr_type,
    options: input.options && input.options.length ? input.options : null,
    unit: input.unit || null,
    placeholder: input.placeholder || null,
    helper_text: input.helper_text || null,
    is_required: input.is_required ?? false,
    is_filterable: input.is_filterable ?? false,
    is_variant: input.is_variant ?? false,
    sort_order: input.sort_order ?? 0,
    is_active: input.is_active ?? true,
  }).select('id').single()
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/attribute-templates')
  return { ok: true as const, data }
}

export async function updateAttribute(id: string, input: Partial<AttributeInput>) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx
  const patch: any = {}
  if (input.label !== undefined)         patch.label = input.label.trim()
  if (input.key !== undefined)           patch.key = keyify(input.key)
  if (input.attr_type !== undefined)     patch.attr_type = input.attr_type
  if (input.options !== undefined)       patch.options = input.options && input.options.length ? input.options : null
  if (input.unit !== undefined)          patch.unit = input.unit || null
  if (input.placeholder !== undefined)   patch.placeholder = input.placeholder || null
  if (input.helper_text !== undefined)   patch.helper_text = input.helper_text || null
  if (input.is_required !== undefined)   patch.is_required = input.is_required
  if (input.is_filterable !== undefined) patch.is_filterable = input.is_filterable
  if (input.is_variant !== undefined)    patch.is_variant = input.is_variant
  if (input.sort_order !== undefined)    patch.sort_order = input.sort_order
  if (input.is_active !== undefined)     patch.is_active = input.is_active
  const { error } = await ctx.supabase.from('attribute_definitions').update(patch).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/attribute-templates')
  return { ok: true as const }
}

export async function deleteAttribute(id: string) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx
  const { error } = await ctx.supabase.from('attribute_definitions').update({ deleted_at: new Date().toISOString(), is_active: false }).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/attribute-templates')
  return { ok: true as const }
}
