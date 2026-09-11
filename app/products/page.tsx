// ============================================================
// THOKSALE — Product Listing Page (Server Component)
// Amazon-style: sidebar filters + sort bar + product grid
// ============================================================

import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { StitchProductCard } from '@/components/marketplace/stitch-product-card'
import { ProductFilters } from '@/components/marketplace/product-filters'
import { MobileFilterDrawer } from '@/components/marketplace/mobile-filter-drawer'
import { CategoryStrip } from '@/components/marketplace/category-strip'
import { ProductSort } from '@/components/marketplace/product-sort'

export const dynamic = 'force-dynamic'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'moq_asc',    label: 'MOQ: Low → High' },
]

const INDIAN_STATES = [
  'Andhra Pradesh','Assam','Bihar','Delhi','Gujarat','Haryana',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana',
  'Uttar Pradesh','Uttarakhand','West Bengal',
]

const SUPPLIER_TYPES = [
  { value: 'manufacturer',           label: 'Manufacturer' },
  { value: 'oem_manufacturer',       label: 'OEM Manufacturer' },
  { value: 'wholesaler',             label: 'Wholesaler' },
  { value: 'distributor',            label: 'Distributor' },
  { value: 'private_label_manufacturer', label: 'Private Label' },
]

type SearchParams = {
  q?: string
  industry?: string
  category?: string
  sort?: string
  min?: string
  max?: string
  moq?: string
  state?: string
  supplierType?: string
  sample?: string
  oem?: string
  page?: string
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-pulse">
          <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function ProductsPage({
  searchParams: rawParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const searchParams = await rawParams
  const supabase = await createClient()
  const PAGE_SIZE = 24
  const page = Math.max(1, Number(searchParams.page ?? 1))
  const offset = (page - 1) * PAGE_SIZE

  // ── Build Supabase query ──────────────────────────────────────────────────
  let query = supabase
    .from('products')
    .select(`
      id, name, slug, base_price, factory_gate_price, moq, unit,
      mfg_location_city, mfg_location_state, supplier_type,
      sample_available, oem_available,
      product_media ( public_url_or_reference, is_primary ),
      brands ( name ),
      company_profiles!products_seller_id_fkey ( display_name, kyc_status )
    `, { count: 'exact' })
    .eq('status', 'active')
    .is('deleted_at', null)
    .range(offset, offset + PAGE_SIZE - 1)

  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`)
  }
  if (searchParams.industry) {
    query = query.eq('industry_id', searchParams.industry)
  }
  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category)
  }
  if (searchParams.min) {
    query = query.gte('base_price', Number(searchParams.min))
  }
  if (searchParams.max) {
    query = query.lte('base_price', Number(searchParams.max))
  }
  if (searchParams.moq) {
    query = query.lte('moq', Number(searchParams.moq))
  }
  if (searchParams.state) {
    query = query.eq('mfg_location_state', searchParams.state)
  }
  if (searchParams.supplierType) {
    query = query.eq('supplier_type', searchParams.supplierType)
  }
  if (searchParams.sample === '1') {
    query = query.eq('sample_available', true)
  }
  if (searchParams.oem === '1') {
    query = query.eq('oem_available', true)
  }

  // Sort
  const sort = searchParams.sort ?? 'newest'
  if (sort === 'price_asc')  query = query.order('base_price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('base_price', { ascending: false })
  else if (sort === 'moq_asc')   query = query.order('moq', { ascending: true })
  else                            query = query.order('created_at', { ascending: false })

  // ── Industries for strip ──────────────────────────────────────────────────
  const [productsRes, industriesRes] = await Promise.allSettled([query, supabase.from('industries').select('id, name, slug').eq('is_active', true).order('sort_order').limit(12)])

  const products = productsRes.status === 'fulfilled' ? productsRes.value.data ?? [] : []
  const totalCount = productsRes.status === 'fulfilled' ? productsRes.value.count ?? 0 : 0
  const industries = industriesRes.status === 'fulfilled' ? industriesRes.value.data ?? [] : []
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const normalizeProduct = (p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    base_price: p.factory_gate_price ?? p.base_price,
    factory_gate_price: p.factory_gate_price,
    moq: p.moq ?? 1,
    unit: (p.unit ?? 'pcs').toLowerCase(),
    sample_available: p.sample_available ?? false,
    oem_available: p.oem_available ?? false,
    mfg_location_city: p.mfg_location_city,
    product_media: p.product_media ?? [],
    seller: {
      display_name: p.company_profiles?.display_name ?? p.brands?.name ?? 'Supplier',
      city: p.mfg_location_city ?? p.mfg_location_state ?? 'India',
      kyc_status: p.company_profiles?.kyc_status ?? 'pending',
    },
  })

  const hasFilters = !!(searchParams.q || searchParams.industry || searchParams.category || searchParams.state || searchParams.supplierType || searchParams.sample || searchParams.oem)

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0A0D14] pb-24 md:pb-8 font-sans">
      <StitchHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">

        {/* Industry strip */}
        <div className="mb-5">
          <CategoryStrip industries={industries} />
        </div>

        {/* Search + sort bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
              {searchParams.q ? `Results for "${searchParams.q}"` : 'Wholesale Catalog'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalCount.toLocaleString('en-IN')} products found
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter button + drawer */}
            <MobileFilterDrawer
              states={INDIAN_STATES}
              supplierTypes={SUPPLIER_TYPES}
              searchParams={searchParams}
            />
            {/* Sort */}
            <ProductSort options={SORT_OPTIONS} defaultValue={sort} />
          </div>
        </div>

        {/* Layout: sidebar + grid */}
        <div className="flex gap-6">

          {/* Sidebar filters (desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilters
              states={INDIAN_STATES}
              supplierTypes={SUPPLIER_TYPES}
              searchParams={searchParams}
            />
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchParams.q && (
                  <FilterChip label={`Search: "${searchParams.q}"`} remove="q" searchParams={searchParams} />
                )}
                {searchParams.state && (
                  <FilterChip label={searchParams.state} remove="state" searchParams={searchParams} />
                )}
                {searchParams.supplierType && (
                  <FilterChip label={SUPPLIER_TYPES.find(t => t.value === searchParams.supplierType)?.label ?? searchParams.supplierType} remove="supplierType" searchParams={searchParams} />
                )}
                {searchParams.sample === '1' && (
                  <FilterChip label="Sample Available" remove="sample" searchParams={searchParams} />
                )}
                {searchParams.oem === '1' && (
                  <FilterChip label="OEM Available" remove="oem" searchParams={searchParams} />
                )}
                <Link
                  href="/products"
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-0.5 px-2 py-1"
                >
                  Clear All
                </Link>
              </div>
            )}

            <Suspense fallback={<Skeleton />}>
              {products.length === 0 ? (
                <EmptyState searchParams={searchParams} />
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {products.map((p) => (
                      <StitchProductCard key={p.id} product={normalizeProduct(p)} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      searchParams={searchParams}
                    />
                  )}
                </>
              )}
            </Suspense>
          </div>
        </div>

      </main>

      <StitchBottomNav />
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function FilterChip({ label, remove, searchParams }: { label: string; remove: string; searchParams: SearchParams }) {
  const params = new URLSearchParams(searchParams as any)
  params.delete(remove)
  params.delete('page')
  return (
    <Link
      href={`/products?${params.toString()}`}
      className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-red-400 hover:text-red-600 transition-colors"
    >
      {label}
      <span className="material-symbols-outlined text-[13px]">close</span>
    </Link>
  )
}

function EmptyState({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">
        search_off
      </span>
      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No products found</h3>
      <p className="text-sm text-slate-500 mt-1 mb-4">
        {searchParams.q ? `No results for "${searchParams.q}"` : 'Try adjusting your filters'}
      </p>
      <Link href="/products" className="bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#B5924D] dark:hover:bg-[#B5924D] dark:hover:text-white transition-all">
        Clear Filters
      </Link>
    </div>
  )
}

function Pagination({ currentPage, totalPages, searchParams }: { currentPage: number; totalPages: number; searchParams: SearchParams }) {
  const getHref = (p: number) => {
    const params = new URLSearchParams(searchParams as any)
    params.set('page', String(p))
    return `/products?${params.toString()}`
  }

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (currentPage <= 4) return i + 1
    if (currentPage >= totalPages - 3) return totalPages - 6 + i
    return currentPage - 3 + i
  })

  return (
    <div className="flex justify-center items-center gap-1.5 mt-8">
      {currentPage > 1 && (
        <Link href={getHref(currentPage - 1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-[#B5924D] transition-colors">
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={getHref(p)}
          className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${
            p === currentPage
              ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#B5924D]'
          }`}
        >
          {p}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link href={getHref(currentPage + 1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-[#B5924D] transition-colors">
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </Link>
      )}
    </div>
  )
}
