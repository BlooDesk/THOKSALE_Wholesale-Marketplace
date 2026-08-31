'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Pencil, Plus, Trash2, BadgeCheck } from 'lucide-react'
import { createBrand, updateBrand, deleteBrand, toggleBrand, verifyBrand } from '@/app/actions/brands'

const OPEN_EVT = 'thok:brand-edit'
function openEditor(payload: any | null) { window.dispatchEvent(new CustomEvent(OPEN_EVT, { detail: payload })) }

export function NewBrandButton() {
  return <Button variant="accent" onClick={() => openEditor(null)}><Plus className="h-4 w-4" /> Add brand</Button>
}

export function BrandTypeFilter({ current, q }: { current: string; q: string }) {
  return (
    <form method="GET" className="flex items-center gap-2">
      <Input name="q" defaultValue={q} placeholder="Search brand…" className="h-10 w-48 text-sm" />
      <select name="type" defaultValue={current} className="h-10 rounded-full border border-input bg-card px-4 text-sm text-foreground focus:outline-none focus:border-accent">
        <option value="all">All types</option>
        <option value="global">Global</option>
        <option value="seller">Seller brand</option>
        <option value="oem">OEM</option>
        <option value="private_label">Private label</option>
      </select>
      <Button type="submit" variant="outline" size="sm">Filter</Button>
    </form>
  )
}

export function BrandRowActions({ brand }: { brand: any }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <div className="flex flex-wrap gap-1">
      <Button variant="ghost" size="sm" onClick={() => openEditor(brand)}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Button>
      <Button variant="ghost" size="sm" onClick={() => start(async () => {
        const res = await verifyBrand(brand.id, !brand.is_verified)
        if (!res.ok) return toast.error(res.error)
        toast.success(brand.is_verified ? 'Unverified' : 'Verified'); router.refresh()
      })} disabled={pending}><BadgeCheck className="mr-1 h-3.5 w-3.5" /> {brand.is_verified ? 'Unverify' : 'Verify'}</Button>
      <Button variant="ghost" size="sm" onClick={() => start(async () => {
        const res = await toggleBrand(brand.id, !brand.is_active)
        if (!res.ok) return toast.error(res.error)
        toast.success('Updated'); router.refresh()
      })} disabled={pending}>{brand.is_active ? 'Disable' : 'Enable'}</Button>
      <Button variant="ghost" size="icon-sm" className="[color:hsl(var(--destructive))]" onClick={() => {
        if (!confirm(`Delete brand “${brand.name}”?`)) return
        start(async () => { const r = await deleteBrand(brand.id); if (!r.ok) return toast.error(r.error); toast.success('Deleted'); router.refresh() })
      }} disabled={pending}><Trash2 className="h-3.5 w-3.5" /></Button>
    </div>
  )
}

export function BrandEditor() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({ name: '', slug: '', brand_type: 'global', description: '', country: '', website: '', logo_url: '', is_active: true, is_verified: false })
  const [pending, start] = useTransition()

  if (typeof window !== 'undefined' && !(window as any).__thok_brand_bound) {
    (window as any).__thok_brand_bound = true
    window.addEventListener(OPEN_EVT, (e: any) => {
      const p = e.detail
      setEditing(p)
      setForm(p ? { name: p.name, slug: p.slug || '', brand_type: p.brand_type, description: p.description || '', country: p.country || '', website: p.website || '', logo_url: p.logo_url || '', is_active: !!p.is_active, is_verified: !!p.is_verified }
                : { name: '', slug: '', brand_type: 'global', description: '', country: '', website: '', logo_url: '', is_active: true, is_verified: false })
      setOpen(true)
    })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = editing ? await updateBrand(editing.id, form) : await createBrand(form)
      if (!res.ok) return toast.error(res.error)
      toast.success(editing ? 'Updated' : 'Created')
      setOpen(false); router.refresh()
    })
  }

  const label = 'text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader><DialogTitle>{editing ? 'Edit brand' : 'New brand'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2"><Label className={label}>Name *</Label><Input required value={form.name} onChange={(e) => setForm((s: any) => ({ ...s, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label className={label}>Slug</Label><Input value={form.slug} onChange={(e) => setForm((s: any) => ({ ...s, slug: e.target.value }))} placeholder="auto" className="font-mono text-xs" /></div>
            <div className="space-y-2"><Label className={label}>Type *</Label>
              <Select value={form.brand_type} onValueChange={(v) => setForm((s: any) => ({ ...s, brand_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="seller">Seller brand</SelectItem>
                  <SelectItem value="oem">OEM</SelectItem>
                  <SelectItem value="private_label">Private label</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className={label}>Country</Label><Input value={form.country} onChange={(e) => setForm((s: any) => ({ ...s, country: e.target.value }))} placeholder="India" /></div>
            <div className="space-y-2"><Label className={label}>Website</Label><Input value={form.website} onChange={(e) => setForm((s: any) => ({ ...s, website: e.target.value }))} placeholder="https://…" /></div>
            <div className="space-y-2 col-span-2"><Label className={label}>Logo URL</Label><Input value={form.logo_url} onChange={(e) => setForm((s: any) => ({ ...s, logo_url: e.target.value }))} /></div>
            <div className="space-y-2 col-span-2"><Label className={label}>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm((s: any) => ({ ...s, description: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Toggle label="Active" checked={form.is_active} onChange={(v) => setForm((s: any) => ({ ...s, is_active: v }))} />
            <Toggle label="Verified" checked={form.is_verified} onChange={(v) => setForm((s: any) => ({ ...s, is_verified: v }))} />
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-secondary/30 px-4 py-2.5 cursor-pointer">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}
