import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarketplaceHeader } from '@/components/marketplace/header'
import { AppFooter } from '@/components/marketplace/footer'
import { ProductCard, PRODUCT_CARD_SELECT } from '@/components/marketplace/product-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowUpRight, Package } from 'lucide-react'

// Cache each industry landing for 5 minutes
export const revalidate = 300

export default async function IndustryLanding(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const supabase = await createClient()

  const { data: industry } = await supabase.from('industries').select('id, name, slug, description').eq('slug', slug).is('deleted_at', null).maybeSingle()
  if (!industry) notFound()

  const { data: categories } = await supabase
    .from('categories').select('id, name, slug, parent_id')
    .is('deleted_at', null).eq('is_active', true).eq('industry_id', industry.id)
    .order('sort_order').order('name')

  const rootCats = (categories || []).filter((c: any) => c.parent_id === null)

  const { data: products } = await supabase
    .from('products')
    .select(PRODUCT_CARD_SELECT)
    .eq('status', 'active').is('deleted_at', null)
    .eq('industry_id', industry.id)
    .order('created_at', { ascending: false })
    .limit(24)

  // Featured brands in this industry
  const { data: brandRows } = await supabase.from('brands').select('id, name, slug, logo_url').eq('is_active', true).is('deleted_at', null).limit(12)

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />

      {/* Hero */}
      <section className="bg-parchment">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <nav className="text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/industries" className="hover:text-foreground">Industries</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{industry.name}</span>
          </nav>
          <p className="serial mt-6">INDUSTRY</p>
          <h1 className="mt-4 display-1 text-foreground text-balance">{industry.name}</h1>
          {industry.description && <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{industry.description}</p>}
          <div className="mt-8 flex gap-3">
            <Link href={`/products?industry=${industry.id}`}><Button size="lg">Browse all listings <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/rfq/new"><Button size="lg" variant="ghost">Post an RFQ <ArrowUpRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {rootCats.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="display-2 text-foreground">Categories</h2>
            <span className="num text-sm text-muted-foreground">{rootCats.length} rails</span>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {rootCats.map((c: any) => (
              <Link key={c.id} href={`/products?industry=${industry.id}&category=${c.id}`} className="group">
                <div className="flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-soft">
                  <Package className="h-5 w-5 text-foreground group-hover:[color:hsl(var(--accent))] transition-colors" strokeWidth={1.5} />
                  <div className="mt-10">
                    <div className="text-[15px] font-semibold text-foreground leading-tight">{c.name}</div>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-accent transition-colors">Browse <ArrowRight className="h-3 w-3" /></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="display-2 text-foreground">Fresh in {industry.name.split(',')[0]}</h2>
          <Link href={`/products?industry=${industry.id}`} className="text-sm font-semibold text-foreground hover:text-accent transition-colors">See all →</Link>
        </div>
        {(!products || products.length === 0) ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border/70 bg-card/60 p-14 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary"><Package className="h-6 w-6 text-foreground" /></span>
            <p className="mt-4 text-sm text-muted-foreground">No listings mapped to this industry yet.</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <AppFooter />
    </div>
  )
}
