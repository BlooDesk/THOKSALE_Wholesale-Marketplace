'use client'

import { createContext, useContext, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { createIndustry, updateIndustry, deleteIndustry, toggleIndustry } from '@/app/actions/industries'

/* Global editor state via localStorage-less context via window event */
const OPEN_EVT = 'thok:industry-edit'
function openEditor(payload: any | null) {
  window.dispatchEvent(new CustomEvent(OPEN_EVT, { detail: payload }))
}

export function NewIndustryButton() {
  return <Button variant="accent" onClick={() => openEditor(null)}><Plus className="h-4 w-4" /> Add industry</Button>
}

export function IndustryRowActions({ industry }: { industry: any }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon-sm" onClick={() => openEditor(industry)}><Pencil className="h-3.5 w-3.5" /></Button>
      <Button variant="ghost" size="sm" onClick={() => start(async () => {
        const res = await toggleIndustry(industry.id, !industry.is_active)
        if (!res.ok) return toast.error(res.error)
        toast.success(industry.is_active ? 'Disabled' : 'Activated'); router.refresh()
      })} disabled={pending}>{industry.is_active ? 'Disable' : 'Enable'}</Button>
      <Button variant="ghost" size="icon-sm" className="[color:hsl(var(--destructive))]" onClick={() => {
        if (!confirm(`Delete industry “${industry.name}”? Categories will remain but their industry link will be cleared.`)) return
        start(async () => {
          const res = await deleteIndustry(industry.id)
          if (!res.ok) return toast.error(res.error)
          toast.success('Deleted'); router.refresh()
        })
      }} disabled={pending}><Trash2 className="h-3.5 w-3.5" /></Button>
    </div>
  )
}

export function IndustryEditor() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({ name: '', slug: '', description: '', icon_name: '', sort_order: 0, is_active: true })
  const [pending, start] = useTransition()

  if (typeof window !== 'undefined' && !(window as any).__thok_industry_bound) {
    (window as any).__thok_industry_bound = true
    window.addEventListener(OPEN_EVT, (e: any) => {
      const p = e.detail
      setEditing(p)
      setForm(p ? { name: p.name, slug: p.slug, description: p.description || '', icon_name: p.icon_name || '', sort_order: p.sort_order || 0, is_active: !!p.is_active }
                : { name: '', slug: '', description: '', icon_name: '', sort_order: 0, is_active: true })
      setOpen(true)
    })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 }
      const res = editing ? await updateIndustry(editing.id, payload) : await createIndustry(payload)
      if (!res.ok) return toast.error(res.error)
      toast.success(editing ? 'Updated' : 'Created')
      setOpen(false); router.refresh()
    })
  }

  const label = 'text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader><DialogTitle>{editing ? 'Edit industry' : 'New industry'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label className={label}>Name *</Label><Input required value={form.name} onChange={(e) => setForm((s: any) => ({ ...s, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label className={label}>Slug</Label><Input value={form.slug} onChange={(e) => setForm((s: any) => ({ ...s, slug: e.target.value }))} placeholder="auto-from-name" className="font-mono text-xs" /></div>
            <div className="space-y-2"><Label className={label}>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm((s: any) => ({ ...s, sort_order: e.target.value }))} /></div>
          </div>
          <div className="space-y-2"><Label className={label}>Icon name</Label><Input value={form.icon_name} onChange={(e) => setForm((s: any) => ({ ...s, icon_name: e.target.value }))} placeholder="lucide-react name (e.g. Shirt)" className="font-mono text-xs" /></div>
          <div className="space-y-2"><Label className={label}>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm((s: any) => ({ ...s, description: e.target.value }))} /></div>
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3">
            <div><Label className={label}>Active</Label><div className="text-xs text-muted-foreground">Visible in marketplace navigation</div></div>
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm((s: any) => ({ ...s, is_active: v }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={pending}>{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {editing ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
