'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save } from 'lucide-react'
import { createPartnerCode, updatePartnerCode, type CodeInput } from '@/app/actions/partner-codes'

type Props = {
  mode: 'create' | 'edit'
  id?: string
  initial?: any
  products: { id: string; name: string }[]
  categories: { id: string; name: string }[]
}

export function CodeForm({ mode, id, initial, products, categories }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<any>({
    code: initial?.code || '',
    discount_type: initial?.discount_type || 'percentage',
    discount_value: initial?.discount_value ?? 10,
    scope: initial?.product_id ? 'product' : initial?.category_id ? 'category' : 'seller',
    product_id: initial?.product_id || '',
    category_id: initial?.category_id || '',
    buyer_email: initial?.buyer_email || '',
    min_order_amount: initial?.min_order_amount ?? 0,
    min_quantity: initial?.min_quantity ?? 1,
    max_uses: initial?.max_uses ?? '',
    valid_from: initial?.valid_from ? initial.valid_from.slice(0, 10) : '',
    valid_until: initial?.valid_until ? initial.valid_until.slice(0, 10) : '',
    is_active: initial?.is_active ?? true,
    notes: initial?.notes || '',
  })
  const [pending, start] = useTransition()

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((s: any) => ({ ...s, [k]: v }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload: CodeInput = {
      code: form.code,
      discount_type: form.discount_type,
      discount_value: parseFloat(String(form.discount_value)),
      product_id: form.scope === 'product' ? form.product_id : null,
      category_id: form.scope === 'category' ? form.category_id : null,
      buyer_id: form.buyer_email || null,
      min_order_amount: form.min_order_amount === '' ? 0 : parseFloat(String(form.min_order_amount)),
      min_quantity: form.min_quantity === '' ? 1 : parseInt(String(form.min_quantity), 10),
      max_uses: form.max_uses === '' ? null : parseInt(String(form.max_uses), 10),
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      is_active: form.is_active,
      notes: form.notes || null,
    }

    start(async () => {
      const res = mode === 'create' ? await createPartnerCode(payload) : await updatePartnerCode(id!, payload)
      if (!res.ok) return toast.error(res.error)
      toast.success(mode === 'create' ? 'Code created' : 'Code updated')
      router.push('/seller/partner-codes')
    })
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Code & discount</CardTitle>
          <CardDescription>Give the code a memorable name and choose the discount.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Code <span className="text-red-500">*</span></Label>
            <Input id="code" required value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} className="font-mono" placeholder="GOLD10" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-3">
            <div>
              <div className="text-sm font-medium">Active</div>
              <div className="text-xs text-slate-500">Buyers can apply this code.</div>
            </div>
            <Switch checked={form.is_active} onCheckedChange={(v) => set('is_active', v)} />
          </div>
          <div className="space-y-2">
            <Label>Discount type</Label>
            <Select value={form.discount_type} onValueChange={(v) => set('discount_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage off</SelectItem>
                <SelectItem value="flat">Flat amount off (per unit)</SelectItem>
                <SelectItem value="fixed_price">Fixed unit price</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount_value">Discount value</Label>
            <Input id="discount_value" type="number" min={0} step={0.01} required value={form.discount_value} onChange={(e) => set('discount_value', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applies to</CardTitle>
          <CardDescription>Restrict which products or buyer this code covers.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Scope</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['seller','category','product'] as const).map((s) => (
                <button key={s} type="button" onClick={() => set('scope', s)}
                  className={`rounded-2xl border p-3 text-sm capitalize transition-all ${form.scope === s ? 'border-accent bg-accent/8 [color:hsl(var(--accent))]' : 'border-border/60 hover:border-border'}`}>
                  {s === 'seller' ? 'Seller-wide' : s}
                </button>
              ))}
            </div>
          </div>
          {form.scope === 'category' && (
            <div className="space-y-2 sm:col-span-2">
              <Label>Category</Label>
              <Select value={form.category_id || ''} onValueChange={(v) => set('category_id', v)}>
                <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {form.scope === 'product' && (
            <div className="space-y-2 sm:col-span-2">
              <Label>Product</Label>
              <Select value={form.product_id || ''} onValueChange={(v) => set('product_id', v)}>
                <SelectTrigger><SelectValue placeholder="Choose product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="buyer_email">Restrict to buyer email (optional)</Label>
            <Input id="buyer_email" type="email" value={form.buyer_email} onChange={(e) => set('buyer_email', e.target.value)} placeholder="buyer@company.com — leave blank for any buyer" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rules</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2"><Label>Min. order amount</Label><Input type="number" min={0} value={form.min_order_amount} onChange={(e) => set('min_order_amount', e.target.value)} /></div>
          <div className="space-y-2"><Label>Min. quantity</Label><Input type="number" min={1} value={form.min_quantity} onChange={(e) => set('min_quantity', e.target.value)} /></div>
          <div className="space-y-2"><Label>Max uses</Label><Input type="number" min={1} placeholder="Unlimited" value={form.max_uses} onChange={(e) => set('max_uses', e.target.value)} /></div>
          <div className="space-y-2" />
          <div className="space-y-2"><Label>Valid from</Label><Input type="date" value={form.valid_from} onChange={(e) => set('valid_from', e.target.value)} /></div>
          <div className="space-y-2"><Label>Valid until</Label><Input type="date" value={form.valid_until} onChange={(e) => set('valid_until', e.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Internal notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/seller/partner-codes')}>Cancel</Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {mode === 'create' ? 'Create code' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
