'use client'

import Link from 'next/link'
import { useState } from 'react'

type SupplierType = { value: string; label: string }
type SearchParams = Record<string, string | undefined>

type Props = {
  states: string[]
  supplierTypes: SupplierType[]
  searchParams: SearchParams
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-sm font-bold text-[#0F172A] dark:text-white hover:text-[#B5924D] transition-colors"
      >
        {title}
        <span className="material-symbols-outlined text-[18px] transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          expand_more
        </span>
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  )
}

function FilterCheckbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer group">
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-[#B5924D] border-[#B5924D]' : 'border-slate-300 dark:border-slate-600 group-hover:border-[#B5924D]'}`}>
        {checked && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
      </div>
      <span className={`text-xs font-medium transition-colors ${checked ? 'text-[#B5924D] font-bold' : 'text-slate-600 dark:text-slate-300 group-hover:text-[#B5924D]'}`}>
        {label}
      </span>
    </label>
  )
}

export function ProductFilters({ states, supplierTypes, searchParams }: Props) {
  const [priceMin, setPriceMin] = useState(searchParams.min ?? '')
  const [priceMax, setPriceMax] = useState(searchParams.max ?? '')
  const [moq, setMoq] = useState(searchParams.moq ?? '')

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const p: Record<string, string> = {}
    const merged = { ...searchParams, ...overrides }
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== 'undefined') p[k] = v
    })
    delete p.page
    return `/products?${new URLSearchParams(p).toString()}`
  }

  const applyPriceRange = () => {
    const href = buildHref({ min: priceMin || undefined, max: priceMax || undefined })
    window.location.href = href
  }

  const applyMoq = () => {
    const href = buildHref({ moq: moq || undefined })
    window.location.href = href
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <span className="text-sm font-black text-[#0F172A] dark:text-white">Filters</span>
        <Link href="/products" className="text-[11px] font-bold text-[#B5924D] hover:underline">
          Clear All
        </Link>
      </div>

      <div className="px-4 divide-y divide-transparent space-y-0">

        {/* B2B Capabilities */}
        <Section title="B2B Capabilities">
          <div className="space-y-0.5">
            <FilterCheckbox
              checked={searchParams.sample === '1'}
              onChange={() => { window.location.href = buildHref({ sample: searchParams.sample === '1' ? undefined : '1' }) }}
              label="Sample Available"
            />
            <FilterCheckbox
              checked={searchParams.oem === '1'}
              onChange={() => { window.location.href = buildHref({ oem: searchParams.oem === '1' ? undefined : '1' }) }}
              label="OEM Manufacturing"
            />
            <FilterCheckbox
              checked={searchParams.verified === '1'}
              onChange={() => { window.location.href = buildHref({ verified: searchParams.verified === '1' ? undefined : '1' }) }}
              label="KYC Verified Only"
            />
          </div>
        </Section>

        {/* Price Range */}
        <Section title="Price Range (₹/unit)">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40"
            />
            <span className="text-slate-400 text-xs">—</span>
            <input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40"
            />
          </div>
          <button
            onClick={applyPriceRange}
            className="mt-2 w-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-bold py-2 rounded-lg hover:bg-[#B5924D] transition-colors"
          >
            Apply
          </button>
        </Section>

        {/* MOQ Filter */}
        <Section title="Max MOQ (units)">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="e.g. 100"
              value={moq}
              onChange={(e) => setMoq(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40"
            />
            <button
              onClick={applyMoq}
              className="flex-shrink-0 bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#B5924D] transition-colors"
            >
              OK
            </button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {[50, 100, 500, 1000].map((v) => (
              <Link
                key={v}
                href={buildHref({ moq: String(v) })}
                className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${searchParams.moq === String(v) ? 'bg-[#B5924D] text-white border-[#B5924D]' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-[#B5924D] hover:text-[#B5924D]'}`}
              >
                ≤{v}
              </Link>
            ))}
          </div>
        </Section>

        {/* Supplier Type */}
        <Section title="Supplier Type">
          <div className="space-y-0.5">
            {supplierTypes.map((t) => (
              <FilterCheckbox
                key={t.value}
                checked={searchParams.supplierType === t.value}
                onChange={() => { window.location.href = buildHref({ supplierType: searchParams.supplierType === t.value ? undefined : t.value }) }}
                label={t.label}
              />
            ))}
          </div>
        </Section>

        {/* State */}
        <Section title="Manufacturing State" defaultOpen={false}>
          <div className="max-h-44 overflow-y-auto space-y-0.5 pr-1">
            {states.map((s) => (
              <FilterCheckbox
                key={s}
                checked={searchParams.state === s}
                onChange={() => { window.location.href = buildHref({ state: searchParams.state === s ? undefined : s }) }}
                label={s}
              />
            ))}
          </div>
        </Section>

      </div>
    </div>
  )
}
