'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { loadCategoryAttributes } from '@/app/actions/product-attributes'
import { Loader2 } from 'lucide-react'

export type AttributeDef = {
  id: string
  key: string
  label: string
  attr_type: 'text'|'number'|'boolean'|'select'|'multi_select'|'date'|'color'|'dimension'|'weight'|'measurement'|'unit'
  options: Array<{ value: string; label: string }> | null
  unit: string | null
  placeholder: string | null
  helper_text: string | null
  is_required: boolean
  is_filterable: boolean
  is_variant: boolean
  sort_order: number
}

type Props = {
  categoryId: string | null
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
}

/**
 * AttributesEditor — renders a product's attribute form dynamically
 * based on the attribute_definitions of the selected (sub)category.
 */
export function AttributesEditor({ categoryId, values, onChange }: Props) {
  const [defs, setDefs] = useState<AttributeDef[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!categoryId) { setDefs([]); return }
    setLoading(true)
    loadCategoryAttributes(categoryId).then((r) => {
      if (r.ok) setDefs(r.data as AttributeDef[])
      setLoading(false)
    })
  }, [categoryId])

  function set(attrId: string, v: any) { onChange({ ...values, [attrId]: v }) }

  if (!categoryId) return null
  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading attribute template…</div>
  if (defs.length === 0) return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 p-6 text-center text-sm text-muted-foreground">
      No attribute template defined for this category yet.
    </div>
  )

  const label = 'text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {defs.map((d) => {
        const v = values[d.id]
        return (
          <div key={d.id} className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label className={label}>{d.label}{d.is_required && <span className="ml-1 text-[color:hsl(var(--destructive))]">*</span>}</Label>
              {d.unit && <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{d.unit}</span>}
            </div>
            {renderField(d, v, (nv) => set(d.id, nv))}
            {d.helper_text && <p className="text-[11px] text-muted-foreground">{d.helper_text}</p>}
          </div>
        )
      })}
    </div>
  )
}

function renderField(d: AttributeDef, v: any, onChange: (v: any) => void) {
  switch (d.attr_type) {
    case 'boolean':
      return (
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/30 px-4 py-2.5">
          <Switch checked={!!v} onCheckedChange={onChange} />
          <span className="text-sm text-foreground/85">{v ? 'Yes' : 'No'}</span>
        </div>
      )
    case 'number':
    case 'dimension':
    case 'weight':
    case 'measurement':
      return <Input type="number" step="any" value={v ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : parseFloat(e.target.value))} placeholder={d.placeholder || '0'} />
    case 'date':
      return <Input type="date" value={v ?? ''} onChange={(e) => onChange(e.target.value)} />
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input type="color" value={v || '#000000'} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 cursor-pointer rounded-xl border border-border" />
          <Input value={v ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="#hex" className="font-mono text-xs" />
        </div>
      )
    case 'select':
    case 'unit':
      return (
        <Select value={v ?? ''} onValueChange={(x) => onChange(x || null)}>
          <SelectTrigger><SelectValue placeholder={d.placeholder || 'Select…'} /></SelectTrigger>
          <SelectContent>
            {(d.options || []).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      )
    case 'multi_select': {
      const arr: string[] = Array.isArray(v) ? v : []
      return (
        <div className="flex flex-wrap gap-1.5">
          {(d.options || []).map((o) => {
            const active = arr.includes(o.value)
            return (
              <button type="button" key={o.value}
                onClick={() => onChange(active ? arr.filter(x => x !== o.value) : [...arr, o.value])}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${active ? 'border-accent bg-accent/10 [color:hsl(var(--accent))]' : 'border-border text-foreground/80 hover:border-border/80'}`}>
                {o.label}
              </button>
            )
          })}
        </div>
      )
    }
    default:
      return d.helper_text && d.helper_text.length > 40 ? (
        <Textarea rows={3} value={v ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={d.placeholder || ''} />
      ) : (
        <Input value={v ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={d.placeholder || ''} />
      )
  }
}
