'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send } from 'lucide-react'
import { createRfq } from '@/app/actions/rfqs'

export function RfqForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter()
  const [form, setForm] = useState<any>({
    title: '', description: '', category_id: '', quantity: 100, unit: 'piece',
    target_price: '', delivery_deadline: '', city: '', state: '', country: 'India',
  })
  const [pending, start] = useTransition()

  function set<K extends string>(k: K, v: any) { setForm((s: any) => ({ ...s, [k]: v })) }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await createRfq({
        title: form.title,
        description: form.description,
        category_id: form.category_id || null,
        quantity: parseInt(form.quantity, 10),
        unit: form.unit,
        target_price: form.target_price ? parseFloat(form.target_price) : null,
        delivery_location: { city: form.city, state: form.state, country: form.country },
        delivery_deadline: form.delivery_deadline || null,
      })
      if (!res.ok) return toast.error(res.error)
      toast.success('RFQ published')
      router.push(`/rfq/${res.data!.id}`)
    })
  }

  const label = 'text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Requirement</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label className={label}>Title *</Label><Input required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Bulk Cotton T-Shirts — mixed sizes" /></div>
          <div className="space-y-2 sm:col-span-2"><Label className={label}>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Specs, materials, packaging preferences, target market…" /></div>
          <div className="space-y-2"><Label className={label}>Category</Label>
            <Select value={form.category_id || 'none'} onValueChange={(v) => set('category_id', v === 'none' ? '' : v)}>
              <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Choose category" /></SelectTrigger>
              <SelectContent><SelectItem value="none">— None —</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label className={label}>Quantity *</Label><Input type="number" min={1} required value={form.quantity} onChange={(e) => set('quantity', e.target.value)} /></div>
          <div className="space-y-2"><Label className={label}>Unit</Label>
            <Select value={form.unit} onValueChange={(v) => set('unit', v)}>
              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>{['piece','kg','ton','box','pack','dozen','set','roll','litre'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label className={label}>Target price (optional, per unit)</Label><Input type="number" min={0} step="0.01" value={form.target_price} onChange={(e) => set('target_price', e.target.value)} /></div>
          <div className="space-y-2"><Label className={label}>Required by</Label><Input type="date" value={form.delivery_deadline} onChange={(e) => set('delivery_deadline', e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Delivery location</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2"><Label className={label}>City</Label><Input value={form.city} onChange={(e) => set('city', e.target.value)} /></div>
          <div className="space-y-2"><Label className={label}>State</Label><Input value={form.state} onChange={(e) => set('state', e.target.value)} /></div>
          <div className="space-y-2"><Label className={label}>Country</Label><Input value={form.country} onChange={(e) => set('country', e.target.value)} /></div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="lg" onClick={() => router.push('/rfq')}>Cancel</Button>
        <Button type="submit" variant="accent" size="lg" disabled={pending}>{pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Publish RFQ</Button>
      </div>
    </form>
  )
}
