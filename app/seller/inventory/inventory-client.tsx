'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function SellerInventoryClient({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems)

  const handleAdjust = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        const newStock = Math.max(0, it.stock + delta)
        return { ...it, stock: newStock }
      })
    )
    toast.success('Stock level updated')
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((it) => {
        const available = it.stock - it.reserved
        return (
          <div
            key={it.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                SKU: {it.sku} • {it.location}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white line-clamp-1">{it.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                <span className="text-slate-500">
                  Total: <strong className="font-mono text-[#0F172A] dark:text-white">{it.stock} {it.unit}</strong>
                </span>
                <span className="text-amber-600">
                  Reserved: <strong className="font-mono">{it.reserved} {it.unit}</strong>
                </span>
                <span className="text-emerald-600 font-semibold">
                  Available: <strong className="font-mono">{available} {it.unit}</strong>
                </span>
              </div>
            </div>

            {/* Adjustment Stepper */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleAdjust(it.id, -100)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
              >
                -100
              </button>
              <button
                onClick={() => handleAdjust(it.id, +100)}
                className="px-3 py-1.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#B5924D] text-xs font-bold transition-colors shadow-xs"
              >
                +100
              </button>
              <button
                onClick={() => handleAdjust(it.id, +500)}
                className="px-3 py-1.5 rounded-xl bg-[#B5924D] text-white hover:bg-[#96773a] text-xs font-bold transition-colors shadow-xs"
              >
                +500 Pallet
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
