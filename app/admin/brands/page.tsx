import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { BrandEditor, BrandRowActions, NewBrandButton, BrandTypeFilter } from './brands-client'
import { Tag, ImageOff } from 'lucide-react'

export default async function AdminBrands(props: { searchParams: Promise<{ type?: string; q?: string }> }) {
  const sp = await props.searchParams
  const type = sp.type || 'all'
  const q = (sp.q || '').trim()

  const supabase = await createClient()
  let query = supabase
    .from('brands')
    .select('id, name, slug, brand_type, seller_id, logo_url, country, website, is_active, is_verified, updated_at')
    .is('deleted_at', null)
    .order('name')
    .limit(300)
  if (type !== 'all') query = query.eq('brand_type', type)
  if (q) query = query.ilike('name', `%${q}%`)
  const { data: brands } = await query

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="serial">02 — BRAND REGISTRY</p>
          <h1 className="mt-3 display-2 text-foreground">Brands</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">Global brands live here. Sellers may register their own brand or private label.</p>
        </div>
        <div className="flex items-center gap-2">
          <BrandTypeFilter current={type} q={q} />
          <NewBrandButton />
        </div>
      </div>

      {(!brands || brands.length === 0) ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border/70 bg-card/60 p-14 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary"><Tag className="h-6 w-6 text-foreground" /></span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No brands yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add your first brand to begin.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(brands as any[]).map((b) => (
            <div key={b.id} className="flex items-start gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
              <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-secondary">
                {b.logo_url ? <img src={b.logo_url} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" /> : <ImageOff className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate font-semibold text-foreground">{b.name}</div>
                  {b.is_verified && <Badge variant="success">Verified</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="capitalize">{String(b.brand_type).replace('_', ' ')}</Badge>
                  {b.country && <span>· {b.country}</span>}
                </div>
                {b.website && <div className="mt-1 truncate text-xs text-muted-foreground">{b.website.replace(/^https?:\/\//, '')}</div>}
                <div className="mt-3"><BrandRowActions brand={b} /></div>
              </div>
            </div>
          ))}
        </div>
      )}
      <BrandEditor />
    </>
  )
}
