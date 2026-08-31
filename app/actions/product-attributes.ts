'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AttrValue = string | number | boolean | null | string[]

/**
 * Persist product attribute values.
 * Idempotent — replaces the full set for the product each call.
 * Only the product owner (seller) or an admin may write.
 */
export async function saveProductAttributes(
  product_id: string,
  values: Record<string, AttrValue>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Not authenticated' }

  // Ownership check
  const { data: p } = await supabase.from('products').select('seller_id').eq('id', product_id).maybeSingle()
  if (!p) return { ok: false as const, error: 'Product not found' }
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (p.seller_id !== user.id && prof?.role !== 'admin') return { ok: false as const, error: 'Not your product' }

  const attrIds = Object.keys(values)
  if (attrIds.length === 0) return { ok: true as const }

  // Get attribute types to know which column to write to
  const { data: defs } = await supabase
    .from('attribute_definitions')
    .select('id, attr_type')
    .in('id', attrIds)
  const typeById: Record<string, string> = {}
  ;(defs || []).forEach((d: any) => { typeById[d.id] = d.attr_type })

  const rows = attrIds
    .map((attribute_id) => {
      const type = typeById[attribute_id]
      if (!type) return null
      const v = values[attribute_id]
      const row: any = { product_id, attribute_id, value_text: null, value_number: null, value_boolean: null, value_json: null }
      if (v === null || v === undefined || v === '') return row  // clear
      if (type === 'number' || type === 'weight' || type === 'dimension' || type === 'measurement') {
        const n = typeof v === 'number' ? v : parseFloat(String(v))
        if (!isNaN(n)) row.value_number = n
      } else if (type === 'boolean') {
        row.value_boolean = Boolean(v)
      } else if (type === 'multi_select') {
        row.value_json = Array.isArray(v) ? v : String(v).split(',').map(s => s.trim()).filter(Boolean)
      } else {
        row.value_text = String(v)
      }
      return row
    })
    .filter(Boolean) as any[]

  // Delete then insert (simplest correctness)
  await supabase.from('product_attributes').delete().eq('product_id', product_id).in('attribute_id', attrIds)
  if (rows.length > 0) {
    const { error } = await supabase.from('product_attributes').insert(rows)
    if (error) return { ok: false as const, error: error.message }
  }

  revalidatePath(`/seller/products/${product_id}/edit`)
  revalidatePath('/products')
  return { ok: true as const }
}

/** Load a category's attribute template (used by the product form). */
export async function loadCategoryAttributes(category_id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attribute_definitions')
    .select('id, key, label, attr_type, options, unit, placeholder, helper_text, is_required, is_filterable, is_variant, sort_order')
    .eq('category_id', category_id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order').order('label')
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const, data: data || [] }
}
