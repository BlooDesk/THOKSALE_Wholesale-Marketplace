'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type CascadeValue = {
  industry_id: string | null
  category_id: string | null       // parent category
  subcategory_id: string | null    // leaf category
}

type Cat = { id: string; name: string; parent_id: string | null; industry_id: string | null }

/**
 * CategoryCascader — Industry → Category → Subcategory.
 * subcategory_id is the leaf FK the product form should use for attribute template lookup.
 */
export function CategoryCascader({
  industries,
  value,
  onChange,
}: {
  industries: Array<{ id: string; name: string }>
  value: CascadeValue
  onChange: (v: CascadeValue) => void
}) {
  const [cats, setCats] = useState<Cat[]>([])

  // Load categories (all) once. Small dataset in this app.
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('categories')
      .select('id, name, parent_id, industry_id')
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => setCats((data as Cat[]) || []))
  }, [])

  const parents = cats.filter((c) => c.parent_id === null && (!value.industry_id || c.industry_id === value.industry_id))
  const subcats = cats.filter((c) => c.parent_id && c.parent_id === value.category_id)

  const label = 'text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label className={label}>Industry *</Label>
        <Select value={value.industry_id || ''} onValueChange={(v) => onChange({ industry_id: v || null, category_id: null, subcategory_id: null })}>
          <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
          <SelectContent>
            {industries.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className={label}>Category</Label>
        <Select value={value.category_id || ''} disabled={!value.industry_id} onValueChange={(v) => onChange({ ...value, category_id: v || null, subcategory_id: null })}>
          <SelectTrigger><SelectValue placeholder={value.industry_id ? (parents.length ? 'Select category' : 'None mapped') : 'Pick industry first'} /></SelectTrigger>
          <SelectContent>
            {parents.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className={label}>Subcategory</Label>
        <Select value={value.subcategory_id || ''} disabled={!value.category_id || subcats.length === 0} onValueChange={(v) => onChange({ ...value, subcategory_id: v || null })}>
          <SelectTrigger><SelectValue placeholder={value.category_id ? (subcats.length ? 'Select subcategory' : 'No subcategories') : 'Pick category first'} /></SelectTrigger>
          <SelectContent>
            {subcats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
