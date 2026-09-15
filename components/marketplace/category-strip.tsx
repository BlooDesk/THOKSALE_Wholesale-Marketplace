// ============================================================
// THOKSALE — Industry Category Strip
// Horizontal scrolling category chips — Blinkit/Zepto style.
// Shows 12 industry icons with active state support.
// ============================================================
'use client'

import Link from 'next/link'

// Lucide icon name → Material Symbol mapping for the 12 industries
const INDUSTRY_ICONS: Record<string, string> = {
  'agri-food':              'agriculture',
  'fmcg-personal-care':     'local_mall',
  'fashion-lifestyle':      'checkroom',
  'construction-building':  'construction',
  'electronics-electrical': 'bolt',
  'automotive-mobility':    'directions_car',
  'industrial-engineering': 'precision_manufacturing',
  'chemicals-materials':    'science',
  'healthcare-wellness':    'health_and_safety',
  'home-living':            'chair',
  'consumer-general':       'category',
  'energy-infrastructure':  'solar_power',
}

const FALLBACK_INDUSTRIES = [
  { id: 'i1',  name: 'Agri & Food',               slug: 'agri-food' },
  { id: 'i2',  name: 'FMCG & Personal Care',      slug: 'fmcg-personal-care' },
  { id: 'i3',  name: 'Fashion & Lifestyle',       slug: 'fashion-lifestyle' },
  { id: 'i4',  name: 'Construction & Building',   slug: 'construction-building' },
  { id: 'i5',  name: 'Electronics & Electrical',  slug: 'electronics-electrical' },
  { id: 'i6',  name: 'Automotive & Mobility',     slug: 'automotive-mobility' },
  { id: 'i7',  name: 'Industrial & Engineering',  slug: 'industrial-engineering' },
  { id: 'i8',  name: 'Chemicals & Materials',     slug: 'chemicals-materials' },
  { id: 'i9',  name: 'Healthcare & Wellness',     slug: 'healthcare-wellness' },
  { id: 'i10', name: 'Home & Living',            slug: 'home-living' },
  { id: 'i11', name: 'Consumer & General Goods',  slug: 'consumer-general' },
  { id: 'i12', name: 'Energy & Infrastructure',  slug: 'energy-infrastructure' },
]

type Industry = { id: string; name: string; slug: string }

export function CategoryStrip({
  industries,
  activeSlug
}: {
  industries?: Industry[]
  activeSlug?: string
}) {
  const items = industries && industries.length > 0 ? industries : FALLBACK_INDUSTRIES

  return (
    <section className="relative py-2">
      <div className="overflow-x-auto flex gap-3 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar scroll-smooth snap-x snap-mandatory">
        {/* All Industries Icon */}
        <Link
          href="/products"
          className="flex flex-col items-center gap-2 min-w-[76px] sm:min-w-[88px] flex-shrink-0 snap-start group"
        >
          <div
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center p-3 transition-all duration-200 ${
              !activeSlug
                ? 'bg-[#B5924D] text-white shadow-md ring-2 ring-[#B5924D]/40 scale-105'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs group-hover:border-[#B5924D] group-hover:shadow-md group-hover:scale-105'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[28px] transition-colors ${
                !activeSlug ? 'text-white' : 'text-slate-600 dark:text-slate-300 group-hover:text-[#B5924D]'
              }`}
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}
            >
              storefront
            </span>
          </div>
          <span
            className={`text-[11px] font-bold text-center leading-tight max-w-[76px] transition-colors ${
              !activeSlug ? 'text-[#B5924D]' : 'text-slate-600 dark:text-slate-400 group-hover:text-[#B5924D]'
            }`}
          >
            All Sectors
          </span>
        </Link>

        {items.map((ind) => {
          const isActive = activeSlug === ind.slug

          return (
            <Link
              key={ind.id}
              href={`/products?industry=${ind.slug}`}
              className="flex flex-col items-center gap-2 min-w-[76px] sm:min-w-[88px] flex-shrink-0 snap-start group"
            >
              <div
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center p-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-[#B5924D]/10 dark:bg-[#B5924D]/20 border-2 border-[#B5924D] shadow-md ring-2 ring-[#B5924D]/30 scale-105'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs group-hover:border-[#B5924D] group-hover:shadow-md group-hover:scale-105'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[28px] transition-colors ${
                    isActive
                      ? 'text-[#B5924D]'
                      : 'text-slate-600 dark:text-slate-300 group-hover:text-[#B5924D]'
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}
                >
                  {INDUSTRY_ICONS[ind.slug] ?? 'category'}
                </span>
              </div>
              <span
                className={`text-[11px] font-bold text-center leading-tight max-w-[76px] transition-colors line-clamp-2 ${
                  isActive
                    ? 'text-[#B5924D]'
                    : 'text-slate-600 dark:text-slate-400 group-hover:text-[#B5924D]'
                }`}
              >
                {ind.name}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
