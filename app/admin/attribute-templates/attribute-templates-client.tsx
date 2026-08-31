'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { createAttribute, updateAttribute, deleteAttribute, type AttrType } from '@/app/actions/attribute-templates'

const OPEN_EVT = 'thok:attr-edit'
function openEditor(payload: any) { window.dispatchEvent(new CustomEvent(OPEN_EVT, { detail: payload })) }

const TYPES: AttrType[] = ['text','number','boolean','select','multi_select','date','color','dimension','weight','measurement','unit']

export function NewAttrButton({ categoryId }: { categoryId: string }) {
  return <Button variant="accent" onClick={() => openEditor({ mode: 'create', categoryId })}><Plus className="h-4 w-4" /> New attribute</Button>
}

export function AttrRowActions({ attr }: { attr: any }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon-sm" onClick={() => openEditor({ mode: 'edit', attr })}><Pencil className="h-3.5 w-3.5" /></Button>
      <Button variant="ghost" size="icon-sm" className="[color:hsl(var(--destructive))]" onClick={() => {
        if (!confirm(`Delete attribute “${attr.label}”?`)) return
        start(async () => { const r = await deleteAttribute(attr.id); if (!r.ok) return toast.error(r.error); router.refresh() })
      }} disabled={pending}><Trash2 className="h-3.5 w-3.5" /></Button>
    </div>
  )
}

export function AttrEditor() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [ctx, setCtx] = useState<{ mode: 'create' | 'edit'; categoryId?: string; attr?: any } | null>(null)
  const [form, setForm] = useState<any>({ label: '', key: '', attr_type: 'text' as AttrType, options: [] as Array<{value: string; label: string}>, unit: '', helper_text: '', is_required: false, is_filterable: false, is_variant: false, sort_order: 0, is_active: true })
  const [pending, start] = useTransition()

  if (typeof window !== 'undefined' && !(window as any).__thok_attr_bound) {
    (window as any).__thok_attr_bound = true
    window.addEventListener(OPEN_EVT, (e: any) => {
      const d = e.detail
      setCtx(d)
      if (d.mode === 'edit') {
        const a = d.attr
        setForm({ label: a.label, key: a.key, attr_type: a.attr_type, options: a.options || [], unit: a.unit || '', helper_text: a.helper_text || '', is_required: !!a.is_required, is_filterable: !!a.is_filterable, is_variant: !!a.is_variant, sort_order: a.sort_order || 0, is_active: !!a.is_active })
      } else {
        setForm({ label: '', key: '', attr_type: 'text', options: [], unit: '', helper_text: '', is_required: false, is_filterable: false, is_variant: false, sort_order: 0, is_active: true })
      }
      setOpen(true)
    })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!ctx) return
    start(async () => {
      const payload: any = { ...form, sort_order: Number(form.sort_order) || 0 }
      if (!['select','multi_select'].includes(form.attr_type)) payload.options = null
      if (ctx.mode === 'edit') {
        const res = await updateAttribute(ctx.attr.id, payload)
        if (!res.ok) return toast.error(res.error)
      } else {
        const res = await createAttribute({ ...payload, category_id: ctx.categoryId! })
        if (!res.ok) return toast.error(res.error)
      }
      toast.success(ctx.mode === 'edit' ? 'Updated' : 'Created')
      setOpen(false); router.refresh()
    })
  }

  const label = 'text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'
  const showOptions = ['select','multi_select'].includes(form.attr_type)
  const showUnit = ['weight','dimension','measurement','unit','number'].includes(form.attr_type)

  function addOption() {
    setForm((s: any) => ({ ...s, options: [...s.options, { value: '', label: '' }] }))
  }
  function updateOption(i: number, k: 'value' | 'label', v: string) {
    setForm((s: any) => { const opts = [...s.options]; opts[i] = { ...opts[i], [k]: v }; return { ...s, options: opts } })
  }
  function removeOption(i: number) {
    setForm((s: any) => ({ ...s, options: s.options.filter((_: any, idx: number) => idx !== i) }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{ctx?.mode === 'edit' ? 'Edit attribute' : 'New attribute'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2"><Label className={label}>Label *</Label><Input required value={form.label} onChange={(e) => setForm((s: any) => ({ ...s, label: e.target.value }))} placeholder="Fabric Type" /></div>
            <div className="space-y-2"><Label className={label}>Key</Label><Input value={form.key} onChange={(e) => setForm((s: any) => ({ ...s, key: e.target.value }))} placeholder="auto" className="font-mono text-xs" /></div>
            <div className="space-y-2"><Label className={label}>Type *</Label>
              <Select value={form.attr_type} onValueChange={(v) => setForm((s: any) => ({ ...s, attr_type: v as AttrType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t.replace('_',' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {showUnit && <div className="space-y-2 col-span-2"><Label className={label}>Unit</Label><Input value={form.unit} onChange={(e) => setForm((s: any) => ({ ...s, unit: e.target.value }))} placeholder="kg, cm, GSM…" /></div>}
            <div className="space-y-2 col-span-2"><Label className={label}>Helper text</Label><Textarea rows={2} value={form.helper_text} onChange={(e) => setForm((s: any) => ({ ...s, helper_text: e.target.value }))} /></div>
            <div className="space-y-2"><Label className={label}>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm((s: any) => ({ ...s, sort_order: e.target.value }))} /></div>
          </div>

          {showOptions && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={label}>Options</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addOption}><Plus className="mr-1 h-3.5 w-3.5" /> Add option</Button>
              </div>
              <div className="space-y-2">
                {form.options.map((opt: any, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="value (machine)" value={opt.value} onChange={(e) => updateOption(i, 'value', e.target.value)} className="font-mono text-xs h-9" />
                    <Input placeholder="Label (human)" value={opt.label} onChange={(e) => updateOption(i, 'label', e.target.value)} className="h-9" />
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeOption(i)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                {form.options.length === 0 && <p className="text-xs text-muted-foreground">Add at least one option.</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Flag label="Required"   checked={form.is_required}   onChange={(v) => setForm((s: any) => ({ ...s, is_required: v }))} />
            <Flag label="Filterable" checked={form.is_filterable} onChange={(v) => setForm((s: any) => ({ ...s, is_filterable: v }))} />
            <Flag label="Variant"    checked={form.is_variant}    onChange={(v) => setForm((s: any) => ({ ...s, is_variant: v }))} />
            <Flag label="Active"     checked={form.is_active}     onChange={(v) => setForm((s: any) => ({ ...s, is_active: v }))} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={pending}>{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {ctx?.mode === 'edit' ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Flag({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-secondary/30 px-4 py-2.5 cursor-pointer">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}
