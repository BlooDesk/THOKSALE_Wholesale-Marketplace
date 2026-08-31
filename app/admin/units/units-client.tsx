'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { createUnit, updateUnit, deleteUnit, toggleUnit } from '@/app/actions/units'

const OPEN_EVT = 'thok:unit-edit'
function openEditor(payload: any | null) { window.dispatchEvent(new CustomEvent(OPEN_EVT, { detail: payload })) }

export function NewUnitButton() {
  return <Button variant="accent" onClick={() => openEditor(null)}><Plus className="h-4 w-4" /> Add unit</Button>
}

export function UnitRowActions({ unit }: { unit: any }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon-sm" onClick={() => openEditor(unit)}><Pencil className="h-3.5 w-3.5" /></Button>
      <Button variant="ghost" size="sm" onClick={() => start(async () => {
        const res = await toggleUnit(unit.id, !unit.is_active)
        if (!res.ok) return toast.error(res.error)
        router.refresh()
      })} disabled={pending}>{unit.is_active ? 'Disable' : 'Enable'}</Button>
      <Button variant="ghost" size="icon-sm" className="[color:hsl(var(--destructive))]" onClick={() => {
        if (!confirm(`Delete unit “${unit.name}”?`)) return
        start(async () => { const r = await deleteUnit(unit.id); if (!r.ok) return toast.error(r.error); router.refresh() })
      }} disabled={pending}><Trash2 className="h-3.5 w-3.5" /></Button>
    </div>
  )
}

export function UnitEditor() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({ code: '', name: '', symbol: '', unit_type: 'measurement', sort_order: 0, is_active: true })
  const [pending, start] = useTransition()

  if (typeof window !== 'undefined' && !(window as any).__thok_unit_bound) {
    (window as any).__thok_unit_bound = true
    window.addEventListener(OPEN_EVT, (e: any) => {
      const p = e.detail
      setEditing(p)
      setForm(p ? { code: p.code, name: p.name, symbol: p.symbol || '', unit_type: p.unit_type, sort_order: p.sort_order || 0, is_active: !!p.is_active }
                : { code: '', name: '', symbol: '', unit_type: 'measurement', sort_order: 0, is_active: true })
      setOpen(true)
    })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 }
      const res = editing ? await updateUnit(editing.id, payload) : await createUnit(payload)
      if (!res.ok) return toast.error(res.error)
      toast.success(editing ? 'Updated' : 'Created')
      setOpen(false); router.refresh()
    })
  }

  const label = 'text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader><DialogTitle>{editing ? 'Edit unit' : 'New unit'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label className={label}>Code *</Label><Input required value={form.code} onChange={(e) => setForm((s: any) => ({ ...s, code: e.target.value }))} placeholder="kg" className="font-mono text-xs" /></div>
            <div className="space-y-2"><Label className={label}>Type *</Label>
              <Select value={form.unit_type} onValueChange={(v) => setForm((s: any) => ({ ...s, unit_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="measurement">Measurement</SelectItem><SelectItem value="packaging">Packaging</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2"><Label className={label}>Name *</Label><Input required value={form.name} onChange={(e) => setForm((s: any) => ({ ...s, name: e.target.value }))} placeholder="Kilogram" /></div>
            <div className="space-y-2"><Label className={label}>Symbol</Label><Input value={form.symbol} onChange={(e) => setForm((s: any) => ({ ...s, symbol: e.target.value }))} placeholder="kg" /></div>
            <div className="space-y-2"><Label className={label}>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm((s: any) => ({ ...s, sort_order: e.target.value }))} /></div>
          </div>
          <label className="flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/30 px-4 py-2.5">
            <span className={label}>Active</span>
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm((s: any) => ({ ...s, is_active: v }))} />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={pending}>{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {editing ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
