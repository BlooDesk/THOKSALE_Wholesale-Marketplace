import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/pricing'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImageOff } from 'lucide-react'
import { ProductRowActions } from './row-actions'

export default async function AdminProducts(props: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const sp = await props.searchParams
  const q = (sp.q || '').trim()
  const status = sp.status || 'all'
  const supabase = await createClient()
  let query = supabase.from('products')
    .select('id, name, slug, base_price, currency, moq, stock_quantity, unit, status, is_featured, updated_at, seller_id, product_images(url, is_primary), seller:profiles!seller_id(company_profiles(display_name, legal_name))')
    .is('deleted_at', null).order('updated_at', { ascending: false }).limit(200)
  if (q) query = query.ilike('name', `%${q}%`)
  if (status !== 'all') query = query.eq('status', status as any)
  const { data: products } = await query

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Catalog</span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">Products</h1>
        </div>
        <form method="GET" className="flex flex-wrap items-center gap-2">
          <select name="status" defaultValue={status} className="h-10 rounded-2xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:border-accent">
            <option value="all">All</option><option value="draft">Draft</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option>
          </select>
          <Input name="q" defaultValue={q} placeholder="Search product" className="h-10 w-56 text-sm" />
          <Button type="submit" size="default" variant="outline">Filter</Button>
        </form>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(products || []).map((p: any) => {
          const img = (p.product_images || []).find((i: any) => i.is_primary)?.url || (p.product_images || [])[0]?.url
          const cp = p.seller?.company_profiles
          return (
            <div key={p.id} className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {img ? <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><ImageOff className="h-8 w-8" /></div>}
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md capitalize">{p.status}</span>
                {p.is_featured && <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">Featured</span>}
              </div>
              <div className="p-5">
                <Link href={`/products/${p.slug || p.id}`} className="line-clamp-1 text-[15px] font-semibold text-foreground hover:text-accent transition-colors">{p.name}</Link>
                <div className="text-xs text-muted-foreground">{cp?.display_name || cp?.legal_name || '—'}</div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div className="font-bold text-foreground">{formatCurrency(Number(p.base_price), p.currency)}</div>
                  <div className="text-xs text-muted-foreground">MOQ {p.moq} · Stock {p.stock_quantity}</div>
                </div>
                <div className="mt-4"><ProductRowActions id={p.id} status={p.status} isFeatured={p.is_featured} /></div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
