// ============================================================
// THOKSALE — Product Listing Page (Server Component)
// Amazon-style: sidebar filters + sort bar + product grid
// With full 12-industry category cards & fallback products
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
import { SubcategoryStrip } from '@/components/marketplace/subcategory-strip'
import { IndustryCategoryGrid } from '@/components/marketplace/industry-category-grid'
import { FALLBACK_TAXONOMY } from '@/lib/taxonomy'
import { FALLBACK_PRODUCTS_BY_INDUSTRY, INDUSTRY_METADATA } from '@/lib/industry-data'

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
  { value: 'manufacturer',               label: 'Manufacturer' },
  { value: 'oem_manufacturer',           label: 'OEM Manufacturer' },
  { value: 'odm_manufacturer',           label: 'ODM Manufacturer' },
  { value: 'contract_manufacturer',      label: 'Contract Manufacturer' },
  { value: 'private_label_manufacturer', label: 'Private Label Manufacturer' },
  { value: 'wholesaler',                 label: 'Wholesaler' },
  { value: 'distributor',                label: 'Distributor' },
  { value: 'importer',                   label: 'Importer' },
  { value: 'exporter',                   label: 'Exporter' },
  { value: 'trader',                     label: 'Trader' },
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
  sub?: string
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

  let industryId: string | null = null
  let categoryId: string | null = null
  let subId: string | null = null

  // 1. Resolve IDs from slugs
  if (searchParams.industry) {
    const { data } = await supabase.from('industries').select('id').eq('slug', searchParams.industry).single()
    if (data) industryId = data.id
  }
  
  if (searchParams.category) {
    const { data } = await supabase.from('categories').select('id').eq('slug', searchParams.category).single()
    if (data) categoryId = data.id
  }

  if (searchParams.sub) {
    const { data } = await supabase.from('categories').select('id').eq('slug', searchParams.sub).single()
    if (data) subId = data.id
  }

  // 2. Apply resolved filters
  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`)
  }
  if (industryId) {
    query = query.eq('industry_id', industryId)
  }
  
  if (subId) {
    query = query.eq('category_id', subId)
  } else if (categoryId) {
    query = query.eq('category_id', categoryId)
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

  // ── Taxonomy for strips ──────────────────────────────────────────────────
  const industriesPromise = supabase.from('industries').select('id, name, slug').eq('is_active', true).order('sort_order').limit(12)
  
  let l1CategoriesPromise = Promise.resolve({ data: [] })
  if (industryId) {
    l1CategoriesPromise = supabase.from('categories').select('id, name, slug').eq('industry_id', industryId).is('parent_id', null).order('sort_order')
  }

  let l2CategoriesPromise = Promise.resolve({ data: [] })
  if (categoryId) {
    l2CategoriesPromise = supabase.from('categories').select('id, name, slug').eq('parent_id', categoryId).order('sort_order')
  }

  const [productsRes, industriesRes, l1Res, l2Res] = await Promise.allSettled([query, industriesPromise, l1CategoriesPromise, l2CategoriesPromise])

  const products = productsRes.status === 'fulfilled' ? productsRes.value.data ?? [] : []
  const totalCount = productsRes.status === 'fulfilled' ? productsRes.value.count ?? 0 : 0
  const industries = industriesRes.status === 'fulfilled' ? industriesRes.value.data ?? [] : []
  let l1Categories = l1Res.status === 'fulfilled' ? (l1Res.value as any).data ?? [] : []
  let l2Categories = l2Res.status === 'fulfilled' ? (l2Res.value as any).data ?? [] : []

  // Fallback to local master taxonomy if database is empty
  if (searchParams.industry) {
    const fallbackInd = FALLBACK_TAXONOMY[searchParams.industry]
    if (fallbackInd) {
      if (l1Categories.length === 0 || !l1Categories[0]?.subcategories) {
        l1Categories = fallbackInd.categories || []
      }
      if (searchParams.category) {
        const cat = l1Categories.find((c: any) => c.slug === searchParams.category)
        if (cat && cat.subcategories) {
          l2Categories = cat.subcategories || []
        }
      }
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const normalizeDbProduct = (p: any) => ({
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
    mfg_location_state: p.mfg_location_state,
    product_media: p.product_media?.length
      ? p.product_media
      : (p.image_url ? [{ public_url_or_reference: p.image_url, is_primary: true }] : []),
    seller: {
      display_name: p.company_profiles?.display_name ?? p.brands?.name ?? p.seller?.display_name ?? 'Verified Manufacturer',
      city: p.mfg_location_city ?? p.mfg_location_state ?? p.seller?.city ?? 'India',
      kyc_status: p.company_profiles?.kyc_status ?? p.seller?.kyc_status ?? 'verified',
    },
  })

  // Determine displayed products (use fallback catalog if database has 0 products)
  let displayedProducts: any[] = products.map(normalizeDbProduct)
  let isUsingFallback = false

  if (displayedProducts.length === 0) {
    isUsingFallback = true
    if (searchParams.industry && FALLBACK_PRODUCTS_BY_INDUSTRY[searchParams.industry]) {
      displayedProducts = [...FALLBACK_PRODUCTS_BY_INDUSTRY[searchParams.industry]]
    } else if (!searchParams.industry) {
      displayedProducts = Object.values(FALLBACK_PRODUCTS_BY_INDUSTRY).flatMap((arr) => arr.slice(0, 2))
    }

    // Apply client filters on fallback items
    if (searchParams.q) {
      const qLower = searchParams.q.toLowerCase()
      displayedProducts = displayedProducts.filter((p) => p.name.toLowerCase().includes(qLower))
    }
    if (searchParams.sample === '1') {
      displayedProducts = displayedProducts.filter((p) => p.sample_available)
    }
    if (searchParams.oem === '1') {
      displayedProducts = displayedProducts.filter((p) => p.oem_available)
    }
    if (searchParams.min) {
      displayedProducts = displayedProducts.filter((p) => p.base_price >= Number(searchParams.min))
    }
    if (searchParams.max) {
      displayedProducts = displayedProducts.filter((p) => p.base_price <= Number(searchParams.max))
    }
    if (searchParams.moq) {
      displayedProducts = displayedProducts.filter((p) => p.moq <= Number(searchParams.moq))
    }
    if (searchParams.state) {
      displayedProducts = displayedProducts.filter((p) => p.mfg_location_state === searchParams.state)
    }

    // Sort fallback items
    if (sort === 'price_asc') {
      displayedProducts.sort((a, b) => a.base_price - b.base_price)
    } else if (sort === 'price_desc') {
      displayedProducts.sort((a, b) => b.base_price - a.base_price)
    } else if (sort === 'moq_asc') {
      displayedProducts.sort((a, b) => a.moq - b.moq)
    }
  }

  const displayedTotalCount = products.length > 0 ? totalCount : displayedProducts.length
  const currentIndustryMeta = searchParams.industry ? INDUSTRY_METADATA[searchParams.industry] : null
  const currentIndustryName = currentIndustryMeta?.name || (searchParams.industry ? FALLBACK_TAXONOMY[searchParams.industry]?.name : undefined)

  const hasFilters = !!(
    searchParams.q ||
    searchParams.industry ||
    searchParams.category ||
    searchParams.sub ||
    searchParams.state ||
    searchParams.supplierType ||
    searchParams.sample ||
    searchParams.oem
  )

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0A0D14] pb-24 md:pb-8 font-sans">
      <StitchHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">

        {/* Industry Category Strip with Active Highlighting */}
        <div className="mb-2">
          <CategoryStrip industries={industries} activeSlug={searchParams.industry} />
        </div>

        {/* Level 1 Category Strip (Horizontal Quick-Pill Filter) */}
        {searchParams.industry && l1Categories.length > 0 && (
          <SubcategoryStrip 
            categories={l1Categories} 
            baseUrl="/products"
            activeSlug={searchParams.category}
            level={1}
          />
        )}

        {/* Level 2 Subcategory Strip (Horizontal Quick-Pill Filter) */}
        {searchParams.category && l2Categories.length > 0 && (
          <SubcategoryStrip 
            categories={l2Categories} 
            baseUrl="/products"
            activeSlug={searchParams.sub}
            level={2}
          />
        )}

        {/* Visual Category & Subcategory Cards Grid (Homepage-level richness) */}
        {searchParams.industry && l1Categories.length > 0 && (
          <div className="mt-5">
            <IndustryCategoryGrid
              industrySlug={searchParams.industry}
              industryName={currentIndustryName}
              categories={l1Categories}
              activeCategorySlug={searchParams.category}
              activeSubSlug={searchParams.sub}
            />
          </div>
        )}

        {/* Search + sort bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 mt-4">
          <div>
            <h1 className="text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
              {searchParams.q
                ? `Results for "${searchParams.q}"`
                : currentIndustryName
                  ? `${currentIndustryName} Wholesale Catalog`
                  : 'Wholesale Catalog'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {displayedTotalCount.toLocaleString('en-IN')} verified products found
              {isUsingFallback && ' · Direct manufacturer inventory'}
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
                {searchParams.industry && (
                  <FilterChip
                    label={`Sector: ${currentIndustryName || searchParams.industry}`}
                    remove="industry"
                    searchParams={searchParams}
                  />
                )}
                {searchParams.category && (
                  <FilterChip
                    label={`Category: ${l1Categories.find((c: any) => c.slug === searchParams.category)?.name || searchParams.category}`}
                    remove="category"
                    searchParams={searchParams}
                  />
                )}
                {searchParams.sub && (
                  <FilterChip
                    label={`Sub: ${l2Categories.find((s: any) => s.slug === searchParams.sub)?.name || searchParams.sub}`}
                    remove="sub"
                    searchParams={searchParams}
                  />
                )}
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

            {/* Industry RFQ Banner */}
            {searchParams.industry && (
              <div className="mb-5 bg-gradient-to-r from-[#0F2016] via-[#1A2E1A] to-[#0F1A2E] rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-[#B5924D] text-[10px] font-black uppercase tracking-wider mb-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    B2B Direct Sourcing in {currentIndustryName}
                  </div>
                  <h3 className="text-white text-sm sm:text-base font-black">
                    Need custom bulk quantity or factory pricing?
                  </h3>
                  <p className="text-white/60 text-xs mt-0.5">
                    Post an RFQ to verified {currentIndustryName} manufacturers & get competitive bids.
                  </p>
                </div>
                <Link
                  href="/rfq/new"
                  className="bg-[#B5924D] hover:bg-[#a37f38] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 flex-shrink-0"
                >
                  Post RFQ
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            )}

            <Suspense fallback={<Skeleton />}>
              {displayedProducts.length === 0 ? (
                <EmptyState searchParams={searchParams} />
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {displayedProducts.map((p) => (
                      <StitchProductCard key={p.id} product={p} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && !isUsingFallback && (
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
