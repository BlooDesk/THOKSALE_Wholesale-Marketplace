import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { StitchProductCard } from '@/components/marketplace/stitch-product-card'
import { CategoryStrip } from '@/components/marketplace/category-strip'
import { TrustStrip } from '@/components/marketplace/trust-strip'
import { DealTimer } from '@/components/marketplace/deal-timer'

export const dynamic = 'force-dynamic'

// ─── Fallbacks (used only when DB is empty / unreachable) ─────────────────
const FALLBACK_INDUSTRIES = [
  { id: 'i1',  name: 'Agri & Food',         slug: 'agri-food' },
  { id: 'i2',  name: 'FMCG & Care',         slug: 'fmcg-personal-care' },
  { id: 'i3',  name: 'Fashion',             slug: 'fashion-lifestyle' },
  { id: 'i4',  name: 'Construction',        slug: 'construction-building' },
  { id: 'i5',  name: 'Electronics',         slug: 'electronics-electrical' },
  { id: 'i6',  name: 'Automotive',          slug: 'automotive-mobility' },
  { id: 'i7',  name: 'Industrial',          slug: 'industrial-engineering' },
  { id: 'i8',  name: 'Chemicals',           slug: 'chemicals-materials' },
  { id: 'i9',  name: 'Healthcare',          slug: 'healthcare-wellness' },
  { id: 'i10', name: 'Home & Living',       slug: 'home-living' },
  { id: 'i11', name: 'Consumer Goods',      slug: 'consumer-general' },
  { id: 'i12', name: 'Energy & Infra',      slug: 'energy-infrastructure' },
]

const FALLBACK_FEATURED = [
  { id: 'f1', name: 'Industrial Grade 50W LED Floodlight IP66', base_price: 340, moq: 50, unit: 'pcs', seller: { display_name: 'Lumina Electricals', city: 'Pune', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=60' },
  { id: 'f2', name: 'Heavy Duty 2-inch Packaging BOPP Tape 65m', base_price: 32, moq: 300, unit: 'rolls', seller: { display_name: 'Apex Tape Mills', city: 'Surat', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60' },
  { id: 'f3', name: 'High Tensile Hex Head M10 Steel Bolts & Nuts', base_price: 8, moq: 1000, unit: 'sets', seller: { display_name: 'Aarav Fasteners', city: 'Ludhiana', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60' },
  { id: 'f4', name: '100% Combed Cotton Single Jersey Fabric 180 GSM', base_price: 240, moq: 100, unit: 'kg', seller: { display_name: 'Tiruppur Spinners', city: 'Tiruppur', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=60' },
]

const FALLBACK_LATEST = [
  { id: 'p1', name: '10000mAh PD Fast Charging Power Bank Dual Output', base_price: 480, moq: 50, unit: 'pcs', seller: { display_name: 'ElectroTech India', city: 'Delhi', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60', sample_available: true },
  { id: 'p2', name: 'Precision 6204-2RS Deep Groove Ball Bearings', base_price: 115, moq: 100, unit: 'pcs', seller: { display_name: 'SteelMax Bearings', city: 'Mumbai', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60', oem_available: true },
  { id: 'p3', name: 'Corrugated 3-Ply Shipping Carton Boxes 12×10×8"', base_price: 18, moq: 500, unit: 'boxes', seller: { display_name: 'EcoPack Industries', city: 'Ahmedabad', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=60' },
  { id: 'p4', name: 'Commercial SS 304 Food Grade Stainless Steel Sheet 1.2mm', base_price: 310, moq: 20, unit: 'sheets', seller: { display_name: 'Jindal Steel Stockists', city: 'Chennai', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=60' },
  { id: 'p5', name: 'Organic Basmati Rice Extra Long Grain Premium Grade', base_price: 82, moq: 200, unit: 'kg', seller: { display_name: 'Golden Grain Exports', city: 'Amritsar', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60' },
  { id: 'p6', name: 'Industrial Grade CPVC Plumbing Pipe 1 inch SDR 11', base_price: 45, moq: 100, unit: 'pcs', seller: { display_name: 'Finolex Pipes', city: 'Pune', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=60' },
  { id: 'p7', name: 'Shea Butter Hand Cream 100ml Wholesale Pack', base_price: 95, moq: 60, unit: 'pcs', seller: { display_name: 'Pure Botanics', city: 'Jaipur', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&auto=format&fit=crop&q=60', sample_available: true },
  { id: 'p8', name: 'TMT Fe500D Reinforcement Bar 8mm — 12m Length', base_price: 68, moq: 5000, unit: 'kg', seller: { display_name: 'JSW Steel Distributors', city: 'Bellary', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=60' },
]

const STAT_PILLS = [
  { value: '12,000+', label: 'Verified Suppliers' },
  { value: '5L+',     label: 'Products Listed' },
  { value: '28',      label: 'States Covered' },
  { value: '₹200Cr+', label: 'GMV Facilitated' },
]

// ─── Deal end time: end of today ──────────────────────────────────────────
function getTodayEnd() {
  const d = new Date()
  d.setHours(23, 59, 59, 0)
  return d
}

// ─── Data normalizer from real DB rows → card-compatible shape ───────────
function normalizeProduct(p: any, fallback: any) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    base_price: p.factory_gate_price ?? p.base_price ?? fallback.base_price,
    factory_gate_price: p.factory_gate_price,
    moq: p.moq ?? fallback.moq,
    unit: (p.unit ?? fallback.unit ?? 'pcs').toLowerCase(),
    sample_available: p.sample_available ?? false,
    oem_available: p.oem_available ?? false,
    mfg_location_city: p.mfg_location_city,
    mfg_location_state: p.mfg_location_state,
    product_media: p.product_media ?? [],
    seller: {
      display_name: p.company_profiles?.display_name ?? p.brands?.name ?? fallback.seller?.display_name,
      city: p.mfg_location_city ?? fallback.seller?.city ?? 'India',
      kyc_status: p.company_profiles?.kyc_status ?? 'verified',
    },
    image_url: fallback.image_url,
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default async function Home() {
  let industries: any[] = FALLBACK_INDUSTRIES
  let featuredProducts: any[] = FALLBACK_FEATURED
  let latestProducts: any[] = FALLBACK_LATEST
  let sellers: any[] = []

  try {
    const supabase = await createClient()

    const [indsRes, featuredRes, latestRes, sellersRes] = await Promise.allSettled([
      supabase
        .from('industries')
        .select('id, name, slug, icon_name')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('sort_order')
        .limit(12),

      supabase
        .from('products')
        .select(`
          id, name, slug, base_price, factory_gate_price, moq, unit,
          mfg_location_city, mfg_location_state, sample_available, oem_available,
          product_media ( public_url_or_reference, is_primary ),
          brands ( name ),
          company_profiles!products_seller_id_fkey ( display_name, kyc_status )
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .is('deleted_at', null)
        .limit(4)
        .order('created_at', { ascending: false }),

      supabase
        .from('products')
        .select(`
          id, name, slug, base_price, factory_gate_price, moq, unit,
          mfg_location_city, mfg_location_state, sample_available, oem_available,
          product_media ( public_url_or_reference, is_primary ),
          brands ( name ),
          company_profiles!products_seller_id_fkey ( display_name, kyc_status )
        `)
        .eq('status', 'active')
        .is('deleted_at', null)
        .limit(8)
        .order('created_at', { ascending: false }),

      supabase
        .from('company_profiles')
        .select('id, display_name, legal_name, city, state, kyc_status, rating, logo_url')
        .eq('kyc_status', 'verified')
        .limit(3),
    ])

    if (indsRes.status === 'fulfilled' && indsRes.value.data?.length) {
      industries = indsRes.value.data
    }
    if (featuredRes.status === 'fulfilled' && featuredRes.value.data?.length) {
      featuredProducts = featuredRes.value.data.map((p, i) =>
        normalizeProduct(p, FALLBACK_FEATURED[i % FALLBACK_FEATURED.length])
      )
    }
    if (latestRes.status === 'fulfilled' && latestRes.value.data?.length) {
      latestProducts = latestRes.value.data.map((p, i) =>
        normalizeProduct(p, FALLBACK_LATEST[i % FALLBACK_LATEST.length])
      )
    }
    if (sellersRes.status === 'fulfilled' && sellersRes.value.data?.length) {
      sellers = sellersRes.value.data
    }
  } catch (err) {
    console.error('[Home] data load error — using fallbacks:', err)
  }

  const dealEnd = getTodayEnd()

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0A0D14] text-[#0F172A] dark:text-slate-100 pb-24 md:pb-8 font-sans">
      <StitchHeader />

      {/* Trust strip — below header, above fold */}
      <div className="bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto">
          <TrustStrip />
        </div>
      </div>

      <main className="max-w-7xl mx-auto flex flex-col gap-7 pt-5 px-4 sm:px-6 lg:px-8">

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A] rounded-3xl p-6 sm:p-10 overflow-hidden shadow-xl">
          {/* Decorative orbs */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-[#B5924D]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-[#B5924D]/20 text-[#B5924D] border border-[#B5924D]/30 text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              India's B2B Wholesale Platform
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
              Source Direct.<br />
              <span className="text-[#B5924D]">Scale Your Business.</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
              Connect directly with 12,000+ KYC-verified Indian manufacturers. Transparent slab MOQ pricing, integrated freight, and escrow-protected payments.
            </p>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mb-7">
              {STAT_PILLS.map((s) => (
                <div key={s.label} className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-center">
                  <div className="text-white font-black text-lg leading-none">{s.value}</div>
                  <div className="text-slate-400 text-[10px] font-semibold mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="bg-[#B5924D] hover:bg-[#a07d3e] text-white font-bold text-sm px-7 py-3 rounded-xl transition-all shadow-lg hover:shadow-[#B5924D]/30 active:scale-95"
              >
                Explore Catalog
              </Link>
              <Link
                href="/rfq/new"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Post RFQ →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Quick Actions ────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/rfq/new',      icon: 'request_quote',   title: 'Post RFQ',       sub: 'Get bulk quotes fast',         color: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40 text-amber-700 dark:text-amber-300' },
            { href: '/seller',       icon: 'storefront',      title: 'Sell Wholesale',  sub: 'List & grow pan-India',       color: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300' },
            { href: '/distribution', icon: 'hub',             title: 'Distribution',    sub: 'Open channel partnerships',   color: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300' },
            { href: '/products',     icon: 'search',          title: 'Search Catalog',  sub: '5 lakh+ products',           color: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300' },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`flex flex-col items-start gap-2 p-4 rounded-2xl border shadow-xs hover:shadow-md transition-all group ${a.color}`}
            >
              <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
                {a.icon}
              </span>
              <div>
                <div className="text-[13px] font-bold leading-tight">{a.title}</div>
                <div className="text-[11px] opacity-70 leading-tight mt-0.5">{a.sub}</div>
              </div>
            </Link>
          ))}
        </section>

        {/* ── Industry Strip ───────────────────────────────────────────────── */}
        <section>
          <div className="flex justify-between items-baseline mb-3">
            <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Shop by Industry
            </h2>
            <Link href="/products" className="text-xs font-bold text-[#B5924D] hover:underline">
              All 12 Industries →
            </Link>
          </div>
          <CategoryStrip industries={industries} />
        </section>

        {/* ── Hot Wholesale Deals (with timer) ─────────────────────────────── */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
                    🔥 Hot Wholesale Deals
                  </h2>
                  <span className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                    Limited Slabs
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Factory-direct prices. MOQ applies.</p>
              </div>
            </div>
            <DealTimer targetDate={dealEnd} label="Ends in" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featuredProducts.slice(0, 4).map((p) => (
              <StitchProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <Link
              href="/products?featured=true"
              className="text-sm font-bold text-[#B5924D] hover:underline inline-flex items-center gap-1"
            >
              View All Deals
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* ── New Arrivals ─────────────────────────────────────────────────── */}
        <section>
          <div className="flex justify-between items-baseline mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#B5924D]">Just Added</span>
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
                New Wholesale Listings
              </h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-[#B5924D] hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {latestProducts.slice(0, 8).map((p) => (
              <StitchProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ── B2B Capability Banner ─────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: 'factory',          title: 'OEM / ODM Manufacturing',    body: 'Custom product development directly with verified Indian factories. MOQ negotiable.' },
            { icon: 'handshake',        title: 'Private Label Ready',        body: 'Source unbranded products and launch your own label with full regulatory compliance.' },
            { icon: 'local_shipping',   title: 'End-to-End Logistics',       body: 'Integrated freight quotes, booking, tracking — Porter, BlackBuck & more.' },
          ].map((card) => (
            <div key={card.title} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0F172A] dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[20px] text-[#B5924D]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {card.icon}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">{card.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{card.body}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Verified Manufacturers ────────────────────────────────────────── */}
        {sellers.length > 0 && (
          <section>
            <div className="flex justify-between items-baseline mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B5924D]">Direct From Factories</span>
                <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
                  Verified Manufacturers
                </h2>
              </div>
              <Link href="/products" className="text-xs font-bold text-[#B5924D] hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {sellers.map((s: any) => (
                <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                      {(s.display_name ?? s.legal_name ?? 'S').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-white truncate flex items-center gap-1">
                        {s.display_name ?? s.legal_name}
                        {s.kyc_status === 'verified' && (
                          <span className="material-symbols-outlined text-emerald-600 text-sm flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        {s.city ?? '—'}{s.state ? `, ${s.state}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      {s.rating ?? '4.8'}
                    </span>
                    <Link href={`/products?seller=${s.id}`} className="text-xs font-bold text-[#B5924D] hover:underline">
                      View Catalog →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-5 shadow-lg">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Ready to grow your wholesale business?
            </h2>
            <p className="text-slate-300 text-sm mt-1">Join 12,000+ suppliers already selling on THOKSALE.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link href="/register" className="bg-[#B5924D] hover:bg-[#a07d3e] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95">
              Start Selling Free
            </Link>
            <Link href="/products" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-5 py-3 rounded-xl transition-all">
              Explore
            </Link>
          </div>
        </section>

      </main>

      <StitchBottomNav />
    </div>
  )
}
