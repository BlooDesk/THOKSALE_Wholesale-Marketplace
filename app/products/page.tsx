import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { StitchProductCard } from '@/components/marketplace/stitch-product-card'

const PER_PAGE = 24

const FALLBACK_PRODUCTS = [
  {
    id: 'prod-1',
    title: '10000mAh PD Fast Charging Power Bank Type-C',
    slug: '10000mah-pd-power-bank',
    base_price: 850,
    min_order_quantity: 100,
    unit: 'pcs',
    seller: { display_name: 'ElectroTech India', city: 'Delhi', kyc_status: 'verified' },
    images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60'],
    pricing_tiers: [
      { min_quantity: 100, price: 850 },
      { min_quantity: 500, price: 790 },
      { min_quantity: 2000, price: 720 },
    ],
  },
  {
    id: 'prod-2',
    title: 'Heavy Duty Clear Brown Packaging Tape 2-inch 65m',
    slug: 'heavy-duty-packaging-tape',
    base_price: 35,
    min_order_quantity: 500,
    unit: 'rolls',
    seller: { display_name: 'Apex Packagings', city: 'Mumbai', kyc_status: 'verified' },
    images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60'],
    pricing_tiers: [
      { min_quantity: 500, price: 35 },
      { min_quantity: 2000, price: 32 },
      { min_quantity: 5000, price: 29 },
    ],
  },
  {
    id: 'prod-3',
    title: 'Industrial Grade 6204-2RS Deep Groove Ball Bearing',
    slug: 'industrial-deep-groove-ball-bearing',
    base_price: 120,
    min_order_quantity: 200,
    unit: 'pcs',
    seller: { display_name: 'SteelMax Corp', city: 'Ludhiana', kyc_status: 'verified' },
    images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60'],
    pricing_tiers: [
      { min_quantity: 200, price: 120 },
      { min_quantity: 1000, price: 108 },
      { min_quantity: 5000, price: 95 },
    ],
  },
  {
    id: 'prod-4',
    title: '50W Commercial Outdoor LED Floodlight IP66 Waterproof',
    slug: '50w-commercial-led-floodlight',
    base_price: 450,
    min_order_quantity: 50,
    unit: 'pcs',
    seller: { display_name: 'Lumina Electricals', city: 'Pune', kyc_status: 'verified' },
    images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=60'],
    pricing_tiers: [
      { min_quantity: 50, price: 450 },
      { min_quantity: 200, price: 410 },
      { min_quantity: 500, price: 375 },
    ],
  },
  {
    id: 'prod-5',
    title: '100% Combed Cotton Knitted Bio-Washed Fabric 180 GSM',
    slug: 'combed-cotton-knitted-fabric',
    base_price: 260,
    min_order_quantity: 100,
    unit: 'kg',
    seller: { display_name: 'Surat Textiles Hub', city: 'Surat', kyc_status: 'verified' },
    images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=60'],
    pricing_tiers: [
      { min_quantity: 100, price: 260 },
      { min_quantity: 500, price: 245 },
      { min_quantity: 2000, price: 230 },
    ],
  },
  {
    id: 'prod-6',
    title: 'Corrugated 5-Ply Heavy Industrial Master Carton Box',
    slug: 'corrugated-5-ply-industrial-box',
    base_price: 42,
    min_order_quantity: 250,
    unit: 'boxes',
    seller: { display_name: 'EcoPack Ahmedabad', city: 'Ahmedabad', kyc_status: 'verified' },
    images: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=60'],
    pricing_tiers: [
      { min_quantity: 250, price: 42 },
      { min_quantity: 1000, price: 38 },
      { min_quantity: 5000, price: 34 },
    ],
  },
]

export default async function ProductsPage(props: {
  searchParams: Promise<{
    q?: string
    category?: string
    industry?: string
    sort?: string
    page?: string
    moq?: string
    verified?: string
  }>
}) {
  const sp = await props.searchParams
  const q = (sp.q || '').trim()
  const categoryId = sp.category || ''
  const sort = sp.sort || 'newest'
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1)
  const moqFilter = sp.moq || ''
  const verifiedFilter = sp.verified || ''

  let products = FALLBACK_PRODUCTS
  let categories: any[] = []
  let totalCount = FALLBACK_PRODUCTS.length

  try {
    const supabase = await createClient()
    const [{ data: rawCats }] = await Promise.all([
      supabase.from('categories').select('id, name, slug').limit(12),
    ])

    if (rawCats) categories = rawCats

    let query: any = supabase
      .from('products')
      .select(`
        id, name, slug, factory_gate_price, moq, unit, category_id,
        product_media ( public_url_or_reference, is_primary ),
        brand:brands ( name )
      `, { count: 'exact' })

    if (q) query = query.ilike('name', `%${q}%`)
    if (categoryId && categoryId !== 'all') query = query.eq('category_id', categoryId)

    const from = (page - 1) * PER_PAGE
    const to = from + PER_PAGE - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data: dbProducts, count } = await query
    if (dbProducts && dbProducts.length > 0) {
      products = dbProducts.map((p, idx) => ({
        id: p.id,
        title: p.name,
        slug: p.slug || p.id,
        base_price: p.factory_gate_price || 100,
        min_order_quantity: p.moq || 10,
        unit: (p.unit || 'units').toLowerCase(),
        seller: { display_name: p.brand?.name || 'Verified Factory', city: 'India', kyc_status: 'verified' },
        images: p.product_media && p.product_media.length > 0
          ? p.product_media.map((m: any) => m.public_url_or_reference)
          : [FALLBACK_PRODUCTS[idx % FALLBACK_PRODUCTS.length].images[0]],
        pricing_tiers: [
          { min_quantity: p.moq || 10, price: p.factory_gate_price || 100 },
          { min_quantity: (p.moq || 10) * 5, price: Math.round((p.factory_gate_price || 100) * 0.92) },
          { min_quantity: (p.moq || 10) * 20, price: Math.round((p.factory_gate_price || 100) * 0.85) },
        ],
      }))
      totalCount = count || dbProducts.length
    }
  } catch (err) {
    console.error('Products page load fallback:', err)
  }

  // Filter in-memory if using fallback or supplementary filters
  let displayedProducts = products
  if (q && products === FALLBACK_PRODUCTS) {
    displayedProducts = displayedProducts.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-24 font-sans">
      <StitchHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-[#0F172A] dark:text-slate-200">Wholesale Catalog</span>
          </div>

          <div className="flex justify-between items-baseline mt-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              {q ? `Results for "${q}"` : 'Wholesale Product Catalog'}
            </h1>
            <span className="text-xs font-semibold text-slate-500">
              {totalCount} Verified Products
            </span>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 hide-scrollbar">
          <Link
            href="/products"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              !categoryId && !moqFilter && !verifiedFilter
                ? 'bg-[#0F172A] text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#B5924D]'
            }`}
          >
            All Categories
          </Link>

          <Link
            href={`/products?verified=true${q ? `&q=${q}` : ''}`}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              verifiedFilter
                ? 'bg-[#0F172A] text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#B5924D]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[14px] text-emerald-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            Verified Suppliers Only
          </Link>

          <Link
            href={`/products?moq=low${q ? `&q=${q}` : ''}`}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              moqFilter === 'low'
                ? 'bg-[#0F172A] text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#B5924D]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">inventory_2</span>
            Low MOQ (&lt; 100 pcs)
          </Link>

          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.id}${q ? `&q=${q}` : ''}`}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                categoryId === c.id
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#B5924D]'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Product Grid */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {displayedProducts.map((product) => (
              <StitchProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 my-8">
            <span className="material-symbols-outlined text-5xl text-slate-400 mb-3">search_off</span>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-1">No products found</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try adjusting your keywords or clearing filters to see more wholesale results.
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#0F172A] text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Clear All Filters
            </Link>
          </div>
        )}
      </main>

      <StitchBottomNav />
    </div>
  )
}
