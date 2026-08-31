'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet'
import { Loader2, Pencil, Plus, Power } from 'lucide-react'
import { upsertCategory, toggleCategoryActive, type CategoryInput } from '@/app/actions/admin'

function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

type Industry = { id: string; name: string }

export function CategoryForm({ parents, industries = [], initial, onSaved }: { parents: any[]; industries?: Industry[]; initial?: any; onSaved?: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<CategoryInput>({
    id: initial?.id, name: initial?.name || '', slug: initial?.slug || '',
    parent_id: initial?.parent_id || null,
    industry_id: initial?.industry_id || null,
    description: initial?.description || '', sort_order: initial?.sort_order || 0, is_active: initial?.is_active ?? true,
  })
  const [pending, start] = useTransition()

  function set<K extends keyof CategoryInput>(k: K, v: CategoryInput[K]) { setForm((s) => ({ ...s, [k]: v })) }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await upsertCategory(form)
      if (!res.ok) return toast.error(res.error)
      toast.success(initial ? 'Category updated' : 'Category created')
      setOpen(false); onSaved?.(); router.refresh()
    })
  }

  const label = 'text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {initial ? (
          <Button variant="ghost" size="icon-sm"><Pencil className="h-3.5 w-3.5" /></Button>
        ) : (
          <Button variant="accent"><Plus className="mr-1 h-4 w-4" /> New category</Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader><SheetTitle>{initial ? 'Edit category' : 'New category'}</SheetTitle></SheetHeader>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2"><Label className={label}>Name *</Label><Input required value={form.name} onChange={(e) => { set('name', e.target.value); if (!initial) set('slug', slugify(e.target.value)) }} /></div>
          <div className="space-y-2"><Label className={label}>Slug *</Label><Input required value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} className="font-mono text-xs" /></div>
          <div className="space-y-2"><Label className={label}>Industry</Label>
            <Select value={form.industry_id || 'none'} onValueChange={(v) => set('industry_id', v === 'none' ? null : v)}>
              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Unassigned —</SelectItem>
                {industries.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label className={label}>Parent category</Label>
            <Select value={form.parent_id || 'none'} onValueChange={(v) => set('parent_id', v === 'none' ? null : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="none">— Top level —</SelectItem>{parents.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label className={label}>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => set('sort_order', parseInt(e.target.value || '0', 10))} /></div>
          <div className="flex items-center gap-3"><input type="checkbox" id="active" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="h-4 w-4 rounded border-border" /><Label htmlFor="active" className="text-sm">Active</Label></div>
          <SheetFooter className="pt-2">
            <Button type="submit" variant="accent" disabled={pending}>{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export function CategoryRowActions({ category, parents, industries = [] }: { category: any; parents: any[]; industries?: Industry[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <div className="flex items-center gap-1">
      <CategoryForm parents={parents} industries={industries} initial={category} />
      <Button size="icon-sm" variant="ghost" disabled={pending} onClick={() => start(async () => {
        const res = await toggleCategoryActive(category.id)
        if (!res.ok) return toast.error(res.error); toast.success('Updated'); router.refresh()
      })} className="text-muted-foreground"><Power className="h-3.5 w-3.5" /></Button>
    </div>
  )
}
