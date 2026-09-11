'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type SortOption = {
  value: string
  label: string
}

export function ProductSort({
  options,
  defaultValue,
}: {
  options: SortOption[]
  defaultValue: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newSort === 'newest') {
      params.delete('sort')
    } else {
      params.set('sort', newSort)
    }
    params.delete('page') // reset page on sort change
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40 cursor-pointer"
      defaultValue={defaultValue}
      onChange={(e) => handleChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
