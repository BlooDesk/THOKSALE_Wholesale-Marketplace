// ============================================================
// THOKSALE — Industry Category Grid Component
// Rich visual category & subcategory cards (Homepage-level aesthetics)
// Displays visual image tiles whenever an industry or category is browsed
// ============================================================
import Link from 'next/link'
import Image from 'next/image'
import { getCategoryVisual, INDUSTRY_METADATA } from '@/lib/industry-data'

type Subcategory = {
  id: string
  name: string
  slug: string
}

type Category = {
  id: string
  name: string
  slug: string
  subcategories?: Subcategory[]
}

interface IndustryCategoryGridProps {
  industrySlug?: string
  industryName?: string
  categories: Category[]
  activeCategorySlug?: string
  activeSubSlug?: string
}

export function IndustryCategoryGrid({
  industrySlug,
  industryName,
  categories,
  activeCategorySlug,
  activeSubSlug,
}: IndustryCategoryGridProps) {
  if (!categories || categories.length === 0) return null

  const meta = industrySlug ? INDUSTRY_METADATA[industrySlug] : null
  const selectedCategory = activeCategorySlug
    ? categories.find((c) => c.slug === activeCategorySlug)
    : null

  // ── Scenario A: Level-1 Category Selected → Show its Subcategories as Cards ──
  if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
    const subcats = selectedCategory.subcategories
    const parentVisual = getCategoryVisual(selectedCategory.slug, industrySlug)

    return (
      <section className="mb-6 bg-white dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#B5924D]">
                {industryName || meta?.name || 'Industry'} &bull; {selectedCategory.name}
              </span>
              <span className="bg-[#B5924D]/10 text-[#B5924D] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {subcats.length} Subcategories
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Explore {selectedCategory.name} Subcategories
            </h2>
          </div>

          <Link
            href={`/products?industry=${industrySlug || ''}`}
            className="text-xs font-bold text-[#B5924D] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            All {industryName || 'Industry'} Categories
          </Link>
        </div>

        {/* Subcategories visual cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {subcats.map((sub) => {
            const isActive = activeSubSlug === sub.slug
            const visual = getCategoryVisual(sub.slug, industrySlug)

            return (
              <Link
                key={sub.id}
                href={`/products?industry=${industrySlug || ''}&category=${selectedCategory.slug}&sub=${sub.slug}`}
                className={`group flex flex-col rounded-xl overflow-hidden border transition-all duration-200 ${
                  isActive
                    ? 'border-[#B5924D] ring-2 ring-[#B5924D]/30 shadow-md bg-[#B5924D]/5'
                    : 'border-slate-200 dark:border-slate-800 hover:border-[#B5924D] hover:shadow-md bg-white dark:bg-slate-900'
                }`}
              >
                <div
                  className="w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800"
                  style={{ aspectRatio: '1/1', backgroundColor: visual.bg }}
                >
                  <Image
                    src={visual.image}
                    alt={sub.name}
                    fill
                    className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <p className="text-xs font-bold text-white text-center leading-snug drop-shadow-sm">
                      {sub.name}
                    </p>
                  </div>
                </div>

                <div className="py-2 px-2 text-center bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
                  <span className={`text-[10px] font-bold ${isActive ? 'text-[#B5924D]' : 'text-slate-600 dark:text-slate-400 group-hover:text-[#B5924D]'}`}>
                    {isActive ? '✓ Selected' : 'View Products →'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    )
  }

  // ── Scenario B: Industry Level View → Show All L1 Categories as Rich Cards ──
  return (
    <section className="mb-7 bg-white dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#B5924D]">
              {meta?.badge || 'Verified Wholesale Categories'}
            </span>
            <span className="bg-[#B5924D]/10 text-[#B5924D] text-[10px] font-bold px-2 py-0.5 rounded-full">
              {categories.length} Categories
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Categories in {industryName || meta?.name || 'this Industry'}
          </h2>
          {meta?.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5 line-clamp-1 sm:line-clamp-none">
              {meta.description}
            </p>
          )}
        </div>

        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
          Select a category to view sub-sectors
        </span>
      </div>

      {/* Category cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {categories.map((cat) => {
          const visual = getCategoryVisual(cat.slug, industrySlug)
          const subCount = cat.subcategories?.length || 0
          const subPreview = cat.subcategories?.slice(0, 3).map((s) => s.name).join(' · ')

          return (
            <Link
              key={cat.id}
              href={`/products?industry=${industrySlug || ''}&category=${cat.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-[#B5924D] hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900"
            >
              {/* Image banner */}
              <div
                className="w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800"
                style={{ aspectRatio: '16/10', backgroundColor: visual.bg }}
              >
                <Image
                  src={visual.image}
                  alt={cat.name}
                  fill
                  className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                
                {/* Subcategories pill tag */}
                {subCount > 0 && (
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-white/20">
                    {subCount} Subcategories
                  </div>
                )}

                {/* Category title on image */}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-md group-hover:text-[#F3E3B6] transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </div>

              {/* Subcategories tags & action bar */}
              <div className="p-3 flex-1 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/50">
                {subPreview ? (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                    {subPreview}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">
                    Browse verified suppliers
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-[#B5924D] group-hover:translate-x-0.5 transition-transform">
                  <span>Explore Products</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
