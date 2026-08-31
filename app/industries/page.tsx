import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MarketplaceHeader } from '@/components/marketplace/header'
import { AppFooter } from '@/components/marketplace/footer'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Building2 } from 'lucide-react'

// Cache the industries hub for 5 minutes — content changes infrequently
export const revalidate = 300

export default async function IndustriesHub() {
  const supabase = await createClient()
  const { data: industries } = await supabase
    .from('industries')
    .select('id, name, slug, description, sort_order')
    .is('deleted_at', null).eq('is_active', true)
    .order('sort_order').order('name')

  // Per-industry product counts (best-effort)
  const { data: prodRows } = await supabase.from('products').select('industry_id').eq('status','active').is('deleted_at', null)
  const counts: Record<string, number> = {}
  ;(prodRows || []).forEach((p: any) => { if (p.industry_id) counts[p.industry_id] = (counts[p.industry_id] || 0) + 1 })

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <p className="serial">CATALOG — INDUSTRIES</p>
        <h1 className="mt-4 display-1 text-foreground text-balance">Every industry, one exchange.</h1>
        <p className="mt-4 lead">Explore the categories and verified suppliers powering each vertical.</p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(industries as any[] || []).map((i) => (
            <Link key={i.id} href={`/industries/${i.slug}`} className="group">
              <div className="flex h-full flex-col justify-between rounded-3xl border border-border/60 bg-card p-7 shadow-soft transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-premium">
                <div>
                  <Building2 className="h-6 w-6 text-foreground group-hover:[color:hsl(var(--accent))] transition-colors" strokeWidth={1.5} />
                  <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground text-balance">{i.name}</h3>
                  {i.description && <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">{i.description}</p>}
                </div>
                <div className="mt-6 flex items-center justify-between text-xs">
                  <span className="num text-muted-foreground">{(counts[i.id] || 0).toLocaleString()} SKUs</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground group-hover:text-accent transition-colors">Enter <ArrowUpRight className="h-3.5 w-3.5" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <AppFooter />
    </div>
  )
}
