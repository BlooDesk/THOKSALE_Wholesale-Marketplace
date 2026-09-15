'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type Category = {
  id: string
  name: string
  slug: string
}

export function SubcategoryStrip({
  categories,
  baseUrl,
  activeSlug,
  level = 1
}: {
  categories: Category[]
  baseUrl: string
  activeSlug?: string
  level?: 1 | 2
}) {
  const searchParams = useSearchParams()

  if (!categories || categories.length === 0) return null

  // We preserve existing search params except the one we are toggling.
  // For Level 1, we replace `category` and clear `sub`.
  // For Level 2, we replace `sub`.
  const buildHref = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (level === 1) {
      if (slug) {
        params.set('category', slug)
      } else {
        params.delete('category')
      }
      params.delete('sub') // Clear subcategory when changing level 1
    } else {
      if (slug) {
        params.set('sub', slug)
      } else {
        params.delete('sub')
      }
    }
    
    // reset pagination on category change
    params.delete('page')

    return `${baseUrl}?${params.toString()}`
  }

  const isDark = level === 2

  return (
    <div className="w-full bg-white dark:bg-[#0A0D14] border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-[125px] z-20">
      <div className="overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-2 min-w-max">
          
          {/* "All" Chip */}
          <Link
            href={buildHref(null)}
            className={`
              flex items-center justify-center px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all
              ${!activeSlug 
                ? 'bg-[#B5924D] text-white shadow-md' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }
            `}
          >
            All
          </Link>

          {/* Category Chips */}
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={buildHref(cat.slug)}
              className={`
                flex items-center justify-center px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all whitespace-nowrap
                ${activeSlug === cat.slug 
                  ? 'bg-[#B5924D] text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }
              `}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
