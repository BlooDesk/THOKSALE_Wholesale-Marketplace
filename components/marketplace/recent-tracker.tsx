'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, ShieldCheck, Heart, Trash2 } from 'lucide-react'

type ShortProduct = {
  id: string
  name: string
  slug: string | null
  base_price: number
  currency: string
  moq: number
  unit: string
  image: string | null
  seller_name: string | null
}

export function RecentlyViewedProducts() {
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<ShortProduct[]>([])

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem('thoksale_viewed_products')
      if (stored) {
        setItems(JSON.parse(stored).slice(0, 5))
      }
    } catch (e) {
      console.error('Error loading recently viewed products', e)
    }
  }, [])

  const handleClear = () => {
    try {
      localStorage.removeItem('thoksale_viewed_products')
      setItems([])
    } catch (e) {
      console.error(e)
    }
  }

  if (!mounted) {
    // Elegant skeleton loading for recently viewed
    return (
      <div className="w-full space-y-4 pt-4">
        <div className="h-6 w-48 rounded bg-zinc-100 animate-pulse" />
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex-shrink-0 w-[240px] h-[110px] rounded-2xl bg-zinc-100/80 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="w-full py-12 rounded-[24px] border border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center text-center p-6 mt-6">
        <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
          <Eye className="h-5 w-5 text-zinc-400" />
        </div>
        <h3 className="text-sm font-bold text-zinc-800">Your Recently Viewed Items</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">
          Products you browse on ThokSale will be tracked locally for seamless procurement workflow.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pt-6">
      <div className="flex items-center justify-between border-b border-zinc-200/40 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4.5 w-4.5 text-[#B5924D]" />
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">Recently Viewed</h2>
        </div>
        <button
          onClick={handleClear}
          className="text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1 p-1"
          aria-label="Clear recently viewed items"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear History
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 scroll-smooth">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.slug || item.id}`}
            className="flex-shrink-0 w-[260px] bg-white border border-zinc-100 rounded-[20px] p-3 shadow-sm hover:shadow-md hover:border-[#B5924D]/20 transition-all duration-300 flex gap-3 group focus:outline-none"
          >
            <div className="relative h-18 w-18 rounded-[14px] bg-zinc-50 border border-zinc-100/50 overflow-hidden shrink-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="72px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-300 bg-zinc-50">
                  <Eye className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
              <div className="space-y-0.5">
                <span className="text-[9px] font-extrabold text-[#B5924D] uppercase tracking-wider block truncate">
                  {item.seller_name || 'Verified Supplier'}
                </span>
                <h3 className="text-xs font-bold text-zinc-800 line-clamp-1 group-hover:text-[#B5924D] transition-colors leading-tight">
                  {item.name}
                </h3>
              </div>

              <div className="flex items-end justify-between gap-1.5 pt-1">
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Starts at</span>
                  <p className="text-xs font-black text-zinc-900 leading-none mt-0.5 num truncate">
                    {item.currency} {Number(item.base_price).toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-600 shrink-0">
                  MOQ {item.moq}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
