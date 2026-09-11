'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type SupplierType = { value: string; label: string }
type SearchParams = Record<string, string | undefined>

type Props = {
  states: string[]
  supplierTypes: SupplierType[]
  searchParams: SearchParams
}

export function MobileFilterDrawer({ states, supplierTypes, searchParams }: Props) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Local draft state for filters
  const [sample, setSample] = useState(searchParams.sample === '1')
  const [oem, setOem] = useState(searchParams.oem === '1')
  const [verified, setVerified] = useState(searchParams.verified === '1')
  const [priceMin, setPriceMin] = useState(searchParams.min ?? '')
  const [priceMax, setPriceMax] = useState(searchParams.max ?? '')
  const [moq, setMoq] = useState(searchParams.moq ?? '')
  const [supplierType, setSupplierType] = useState(searchParams.supplierType ?? '')
  const [state, setState] = useState(searchParams.state ?? '')

  // Count active filters in current URL params
  const activeCount = [
    searchParams.sample === '1',
    searchParams.oem === '1',
    searchParams.verified === '1',
    searchParams.min,
    searchParams.max,
    searchParams.moq,
    searchParams.supplierType,
    searchParams.state,
  ].filter(Boolean).length

  // Sync draft state when drawer opens or searchParams change
  useEffect(() => {
    setSample(searchParams.sample === '1')
    setOem(searchParams.oem === '1')
    setVerified(searchParams.verified === '1')
    setPriceMin(searchParams.min ?? '')
    setPriceMax(searchParams.max ?? '')
    setMoq(searchParams.moq ?? '')
    setSupplierType(searchParams.supplierType ?? '')
    setState(searchParams.state ?? '')
  }, [searchParams, isOpen])

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleApply = () => {
    const params = new URLSearchParams()
    // Retain search query and industry/category if present
    if (searchParams.q) params.set('q', searchParams.q)
    if (searchParams.industry) params.set('industry', searchParams.industry)
    if (searchParams.category) params.set('category', searchParams.category)
    if (searchParams.sort) params.set('sort', searchParams.sort)

    if (sample) params.set('sample', '1')
    if (oem) params.set('oem', '1')
    if (verified) params.set('verified', '1')
    if (priceMin) params.set('min', priceMin)
    if (priceMax) params.set('max', priceMax)
    if (moq) params.set('moq', moq)
    if (supplierType) params.set('supplierType', supplierType)
    if (state) params.set('state', state)

    setIsOpen(false)
    router.push(`/products?${params.toString()}`)
  }

  const handleReset = () => {
    setSample(false)
    setOem(false)
    setVerified(false)
    setPriceMin('')
    setPriceMax('')
    setMoq('')
    setSupplierType('')
    setState('')

    const params = new URLSearchParams()
    if (searchParams.q) params.set('q', searchParams.q)
    if (searchParams.industry) params.set('industry', searchParams.industry)
    if (searchParams.category) params.set('category', searchParams.category)
    if (searchParams.sort) params.set('sort', searchParams.sort)

    setIsOpen(false)
    router.push(`/products${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <>
      {/* Trigger Button — only visible on mobile/tablet (< lg) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:border-[#B5924D] transition-colors shadow-xs"
        aria-label="Open filter menu"
      >
        <span className="material-symbols-outlined text-[16px] text-[#B5924D]">tune</span>
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-[#B5924D] text-white text-[10px] font-black flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay + Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer container (slides up from bottom) */}
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl flex flex-col z-10 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-250">
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-[#0F172A] dark:text-white">Filters</span>
                {activeCount > 0 && (
                  <span className="text-xs bg-[#B5924D]/15 text-[#B5924D] font-bold px-2 py-0.5 rounded-full">
                    {activeCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold text-[#B5924D] hover:underline"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Scrollable Filters Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 divide-y divide-slate-100 dark:divide-slate-800">

              {/* B2B Capabilities */}
              <div className="pt-1 first:pt-0">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
                  B2B Capabilities
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sample}
                      onChange={(e) => setSample(e.target.checked)}
                      className="w-4 h-4 rounded text-[#B5924D] focus:ring-[#B5924D] accent-[#B5924D]"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Sample Available</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={oem}
                      onChange={(e) => setOem(e.target.checked)}
                      className="w-4 h-4 rounded text-[#B5924D] focus:ring-[#B5924D] accent-[#B5924D]"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">OEM Manufacturing</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verified}
                      onChange={(e) => setVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-[#B5924D] focus:ring-[#B5924D] accent-[#B5924D]"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">KYC Verified Only</span>
                  </label>
                </div>
              </div>

              {/* Price Range */}
              <div className="pt-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
                  Price Range (₹/unit)
                </h4>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40"
                  />
                  <span className="text-slate-400 text-xs">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40"
                  />
                </div>
              </div>

              {/* MOQ Filter */}
              <div className="pt-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
                  Max MOQ (units)
                </h4>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[50, 100, 500, 1000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setMoq(moq === String(v) ? '' : String(v))}
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-colors ${
                        moq === String(v)
                          ? 'bg-[#B5924D] text-white border-[#B5924D]'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      ≤{v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supplier Type */}
              <div className="pt-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
                  Supplier Type
                </h4>
                <div className="space-y-2">
                  {supplierTypes.map((t) => (
                    <label key={t.value} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="mobile_supplier_type"
                        checked={supplierType === t.value}
                        onChange={() => setSupplierType(supplierType === t.value ? '' : t.value)}
                        onClick={() => {
                          if (supplierType === t.value) setSupplierType('')
                        }}
                        className="w-4 h-4 text-[#B5924D] focus:ring-[#B5924D] accent-[#B5924D]"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Manufacturing State */}
              <div className="pt-4 pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
                  Manufacturing State
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {states.map((s) => (
                    <label key={s} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="mobile_state"
                        checked={state === s}
                        onChange={() => setState(state === s ? '' : s)}
                        onClick={() => {
                          if (state === s) setState('')
                        }}
                        className="w-4 h-4 text-[#B5924D] focus:ring-[#B5924D] accent-[#B5924D]"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Sticky Action Bar */}
            <div
              className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0"
              style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}
            >
              <button
                type="button"
                onClick={handleApply}
                className="w-full bg-[#B5924D] hover:bg-[#a07d3e] text-white font-black text-sm py-3.5 rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Apply Filters</span>
                {activeCount > 0 && <span>({activeCount})</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
