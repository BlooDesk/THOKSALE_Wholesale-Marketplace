// ============================================================
// THOKSALE — Industry Category Strip
// Horizontal scrolling category chips — Blinkit/Zepto style.
// Shows 12 industry icons. Used on homepage & product listing.
// ============================================================
'use client'

import Link from 'next/link'

// Lucide icon name → Material Symbol mapping for the 12 industries
const INDUSTRY_ICONS: Record<string, string> = {
  'agri-food':              'agriculture',
  'fmcg-personal-care':    'local_mall',
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
  { id: 'i1', name: 'Agri & Food',               slug: 'agri-food' },
  { id: 'i2', name: 'FMCG & Care',               slug: 'fmcg-personal-care' },
  { id: 'i3', name: 'Fashion',                   slug: 'fashion-lifestyle' },
  { id: 'i4', name: 'Construction',              slug: 'construction-building' },
  { id: 'i5', name: 'Electronics',               slug: 'electronics-electrical' },
  { id: 'i6', name: 'Automotive',                slug: 'automotive-mobility' },
  { id: 'i7', name: 'Industrial',                slug: 'industrial-engineering' },
  { id: 'i8', name: 'Chemicals',                 slug: 'chemicals-materials' },
  { id: 'i9', name: 'Healthcare',                slug: 'healthcare-wellness' },
  { id: 'i10', name: 'Home & Living',            slug: 'home-living' },
  { id: 'i11', name: 'Consumer Goods',           slug: 'consumer-general' },
  { id: 'i12', name: 'Energy & Infra',           slug: 'energy-infrastructure' },
]

type Industry = { id: string; name: string; slug: string }

export function CategoryStrip({ industries }: { industries?: Industry[] }) {
  const items = industries && industries.length > 0 ? industries : FALLBACK_INDUSTRIES

  return (
    <section className="relative">
      <div className="overflow-x-auto flex gap-3 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar scroll-smooth snap-x snap-mandatory">
        {items.map((ind) => (
          <Link
            key={ind.id}
            href={`/products?industry=${ind.id}`}
            className="flex flex-col items-center gap-2 min-w-[76px] sm:min-w-[88px] flex-shrink-0 snap-start group"
          >
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-center p-3 group-hover:border-[#B5924D] group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <span
                className="material-symbols-outlined text-[28px] text-slate-600 dark:text-slate-300 group-hover:text-[#B5924D] transition-colors"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}
              >
                {INDUSTRY_ICONS[ind.slug] ?? 'category'}
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight max-w-[76px] group-hover:text-[#B5924D] transition-colors">
              {ind.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
