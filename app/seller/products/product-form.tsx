'use client'

import { useState, useTransition, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Save, Upload, Trash2, Star, StarOff, Image as ImageIcon, Package, Layers, Tag, Ruler } from 'lucide-react'
import {
  createProduct, updateProduct, attachProductImage, deleteProductImage, setPrimaryImage,
  type ProductInput, type ProductStatus,
} from '@/app/actions/products'
import { saveProductAttributes } from '@/app/actions/product-attributes'
import type { CascadeValue } from '@/components/catalog/category-cascader'

// Heavy client components (Radix Combobox + async fetch) — split into their own chunks
const CategoryCascader = dynamic(
  () => import('@/components/catalog/category-cascader').then((m) => m.CategoryCascader),
  { ssr: false, loading: () => <Skeleton className="h-32 w-full rounded-2xl" /> }
)
const AttributesEditor = dynamic(
  () => import('@/components/catalog/attributes-editor').then((m) => m.AttributesEditor),
  { ssr: false, loading: () => <Skeleton className="h-24 w-full rounded-xl" /> }
)

const STATUSES: { value: ProductStatus; label: string; hint: string }[] = [
  { value: 'draft', label: 'Draft', hint: 'Hidden from buyers' },
  { value: 'active', label: 'Active', hint: 'Visible & orderable' },
  { value: 'inactive', label: 'Inactive', hint: 'Hidden temporarily' },
]

type Industry = { id: string; name: string }
type Brand = { id: string; name: string }
type Unit = { id: string; name: string; symbol: string | null; unit_type: string }
type ProductImage = { id: string; url: string; is_primary: boolean; sort_order: number }
type Product = any

export function ProductForm({
  mode,
  industries,
  brands,
  units,
  product,
  existingImages = [],
  existingAttributes = {},
}: {
  mode: 'create' | 'edit'
  industries: Industry[]
  brands: Brand[]
  units: Unit[]
  product?: Product
  existingImages?: ProductImage[]
  existingAttributes?: Record<string, any>
}) {
  const router = useRouter()
  const initialId = useMemo(() => product?.id || (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2) + Date.now()), [product?.id])

  const [cascade, setCascade] = useState<CascadeValue>({
    industry_id: product?.industry_id || null,
    category_id: product?.category_id || null,
    subcategory_id: product?.subcategory_id || null,
  })

  const [form, setForm] = useState({
    id: initialId,
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    base_price: product?.base_price != null ? String(product.base_price) : '',
    moq: product?.moq != null ? String(product.moq) : '1',
    stock_quantity: product?.stock_quantity != null ? String(product.stock_quantity) : '0',
    unit: product?.unit || 'piece',
    status: (product?.status || 'draft') as ProductStatus,
    brand: product?.brand || '',
    brand_id: product?.brand_id || '',
    packaging_unit_id: product?.packaging_unit_id || '',
    measurement_unit_id: product?.measurement_unit_id || '',
  })

  const [attrValues, setAttrValues] = useState<Record<string, any>>(existingAttributes || {})

  const [images, setImages] = useState<{ id?: string; url: string; is_primary: boolean }[]>(
    existingImages.map((i) => ({ id: i.id, url: i.url, is_primary: i.is_primary }))
  )
  const [pending, start] = useTransition()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const packagingUnits = units.filter((u) => u.unit_type === 'packaging' || u.unit_type === 'count')
  const measurementUnits = units.filter((u) => u.unit_type !== 'packaging' && u.unit_type !== 'count')

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [k]: v }))
  }

  async function onUploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (file.size > 8 * 1024 * 1024) { toast.error(`${file.name}: over 8MB`); continue }
        const fd = new FormData()
        fd.append('file', file)
        fd.append('product_id', form.id)
        const res = await fetch('/api/seller/products/upload-image', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) { toast.error(json.error || 'Upload failed'); continue }

        if (mode === 'edit') {
          const attach = await attachProductImage(form.id, json.url)
          if (!attach.ok) { toast.error(attach.error); continue }
          setImages((imgs) => [...imgs, { id: attach.data!.id, url: json.url, is_primary: imgs.length === 0 }])
        } else {
          setImages((imgs) => [...imgs, { url: json.url, is_primary: imgs.length === 0 }])
        }
      }
      toast.success('Images uploaded')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function onRemoveImage(idx: number) {
    const img = images[idx]
    start(async () => {
      if (img.id) {
        const res = await deleteProductImage(img.id)
        if (!res.ok) return toast.error(res.error)
      }
      setImages((imgs) => {
        const next = imgs.filter((_, i) => i !== idx)
        if (next.length && !next.some((i) => i.is_primary)) next[0].is_primary = true
        return next
      })
      toast.success('Image removed')
    })
  }

  function onSetPrimary(idx: number) {
    const img = images[idx]
    start(async () => {
      if (img.id) {
        const res = await setPrimaryImage(img.id)
        if (!res.ok) return toast.error(res.error)
      }
      setImages((imgs) => imgs.map((i, k) => ({ ...i, is_primary: k === idx })))
    })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const base = parseFloat(form.base_price)
    const moq = parseInt(form.moq, 10)
    const stock = parseInt(form.stock_quantity, 10)
    if (!form.name.trim()) return toast.error('Product name is required')
    if (isNaN(base) || base < 0) return toast.error('Base price must be a valid number')
    if (isNaN(moq) || moq < 1) return toast.error('MOQ must be at least 1')
    if (isNaN(stock) || stock < 0) return toast.error('Stock quantity cannot be negative')
    if (!cascade.industry_id) return toast.error('Please pick an industry')

    // Derive leaf category_id: prefer subcategory (leaf), else the parent category itself.
    const leafCategoryId = cascade.subcategory_id || cascade.category_id || null

    const payload: ProductInput = {
      id: form.id,
      name: form.name.trim(),
      sku: form.sku,
      category_id: leafCategoryId,
      industry_id: cascade.industry_id,
      subcategory_id: cascade.subcategory_id,
      brand_id: form.brand_id || null,
      packaging_unit_id: form.packaging_unit_id || null,
      measurement_unit_id: form.measurement_unit_id || null,
      description: form.description,
      brand: form.brand,
      base_price: base,
      moq,
      stock_quantity: stock,
      unit: form.unit,
      status: form.status,
    }

    start(async () => {
      if (mode === 'create') {
        const urls = images.map((i) => i.url)
        const res = await createProduct(payload, urls)
        if (!res.ok) return toast.error(res.error)
        // Persist dynamic attributes
        if (Object.keys(attrValues).length > 0) {
          await saveProductAttributes(res.data!.id, attrValues)
        }
        toast.success('Product created')
        router.push(`/seller/products/${res.data!.id}/edit`)
      } else {
        const res = await updateProduct(payload)
        if (!res.ok) return toast.error(res.error)
        if (Object.keys(attrValues).length > 0) {
          await saveProductAttributes(form.id, attrValues)
        }
        toast.success('Product updated')
        router.refresh()
      }
    })
  }

  const attrCategoryId = cascade.subcategory_id || cascade.category_id

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      {/* Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Layers className="h-4 w-4" /> Classification</CardTitle>
          <CardDescription>Where does this product live in the ThokSale catalog?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <CategoryCascader industries={industries} value={cascade} onChange={setCascade} />
        </CardContent>
      </Card>

      {/* Basics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Package className="h-4 w-4" /> Basics</CardTitle>
          <CardDescription>Product identity, brand and SKU.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Product name <span className="text-red-500">*</span></Label>
            <Input id="name" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Cotton Blend Round-Neck T-Shirt" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="e.g. TSH-CB-001" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand_id" className="flex items-center gap-1.5"><Tag className="h-3 w-3" /> Brand</Label>
            <Select value={form.brand_id || 'none'} onValueChange={(v) => set('brand_id', v === 'none' ? '' : v)}>
              <SelectTrigger id="brand_id"><SelectValue placeholder="Select brand" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— No brand / private label —</SelectItem>
                {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Materials, specifications, packaging, certifications…" />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Ruler className="h-4 w-4" /> Pricing, Units & Inventory</CardTitle>
          <CardDescription>Base price, packaging and measurement units.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="base_price">Base factory price (INR) <span className="text-red-500">*</span></Label>
            <Input id="base_price" required type="number" min={0} step="0.01" value={form.base_price} onChange={(e) => set('base_price', e.target.value)} placeholder="e.g. 149.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="packaging_unit_id">Packaging unit</Label>
            <Select value={form.packaging_unit_id || 'none'} onValueChange={(v) => set('packaging_unit_id', v === 'none' ? '' : v)}>
              <SelectTrigger id="packaging_unit_id"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {packagingUnits.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}{u.symbol ? ` (${u.symbol})` : ''}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="measurement_unit_id">Measurement unit</Label>
            <Select value={form.measurement_unit_id || 'none'} onValueChange={(v) => set('measurement_unit_id', v === 'none' ? '' : v)}>
              <SelectTrigger id="measurement_unit_id"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {measurementUnits.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}{u.symbol ? ` (${u.symbol})` : ''}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Legacy unit label <span className="text-red-500">*</span></Label>
            <Input id="unit" required value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="piece" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="moq">Min Order Qty <span className="text-red-500">*</span></Label>
            <Input id="moq" required type="number" min={1} step={1} value={form.moq} onChange={(e) => set('moq', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock_quantity">Available quantity <span className="text-red-500">*</span></Label>
            <Input id="stock_quantity" required type="number" min={0} step={1} value={form.stock_quantity} onChange={(e) => set('stock_quantity', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Attributes */}
      {attrCategoryId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Ruler className="h-4 w-4" /> Category Attributes</CardTitle>
            <CardDescription>Specifications specific to this category. These fuel Marketplace filters.</CardDescription>
          </CardHeader>
          <CardContent>
            <AttributesEditor categoryId={attrCategoryId} values={attrValues} onChange={setAttrValues} />
          </CardContent>
        </Card>
      )}

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Product Images</CardTitle>
          <CardDescription>PNG, JPG or WebP up to 8MB. First image is used as the primary.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img, idx) => (
              <div key={img.id || img.url} className="group relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-muted">
                <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                {img.is_primary && (
                  <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">Primary</span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                  <button type="button" onClick={() => onSetPrimary(idx)} disabled={img.is_primary || pending} className="rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-slate-900 hover:bg-white disabled:opacity-50">
                    {img.is_primary ? <Star className="h-3 w-3 fill-current" /> : <><StarOff className="mr-1 inline h-3 w-3" /> Make primary</>}
                  </button>
                  <button type="button" onClick={() => onRemoveImage(idx)} disabled={pending} className="rounded-md bg-red-600/95 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-card text-muted-foreground transition-colors hover:border-accent hover:[color:hsl(var(--accent))] disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              <span className="text-xs font-medium">{uploading ? 'Uploading…' : 'Add image'}</span>
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(e) => onUploadFiles(e.target.files)} />
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Publish</CardTitle>
          <CardDescription>Set the visibility of this product.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {STATUSES.map((s) => (
              <button
                type="button"
                key={s.value}
                onClick={() => set('status', s.value)}
                className={`rounded-2xl border p-4 text-left transition-all ${form.status === s.value ? 'border-accent bg-accent/8 ring-2 ring-accent/25' : 'border-border/60 bg-card hover:border-border'}`}
              >
                <div className="font-semibold capitalize">{s.label}</div>
                <div className="mt-1 text-xs text-slate-600">{s.hint}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sticky footer */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto flex max-w-4xl items-center justify-end gap-2 px-4 py-3 sm:px-6">
          <Button type="button" variant="outline" onClick={() => router.push('/seller/products')} disabled={pending}>Cancel</Button>
          <Button type="submit" disabled={pending || uploading} variant="accent">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {mode === 'create' ? 'Create product' : 'Save changes'}
          </Button>
        </div>
      </div>
    </form>
  )
}
