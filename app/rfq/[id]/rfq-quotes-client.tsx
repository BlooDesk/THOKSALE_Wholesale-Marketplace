'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function RfqQuotesClient({ quotes, rfqId }: { quotes: any[]; rfqId: string }) {
  const router = useRouter()
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(quotes[0]?.id || null)
  const [accepting, setAccepting] = useState(false)

  const handleAccept = (quote: any) => {
    setAccepting(true)
    setTimeout(() => {
      setAccepting(false)
      toast.success(`Quote from ${quote.supplier_name} accepted! Redirecting to Escrow Contract.`)
      router.push(`/checkout/payment?orderId=RFQ-${rfqId.slice(-4)}&amount=${quote.total_amount}`)
    }, 1000)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Factory Quotations ({quotes.length} Verified Bids)
        </h2>
        <span className="text-xs font-semibold text-emerald-600">Lowest Bid: ₹{quotes[0]?.unit_price} / unit</span>
      </div>

      <div className="flex flex-col gap-4">
        {quotes.map((q) => {
          const isSelected = selectedQuoteId === q.id
          return (
            <div
              key={q.id}
              onClick={() => setSelectedQuoteId(q.id)}
              className={`cursor-pointer bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 transition-all space-y-4 shadow-xs ${
                isSelected
                  ? 'border-[#B5924D] ring-2 ring-[#B5924D]/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white">
                      {q.supplier_name}
                    </h3>
                    <span
                      className="material-symbols-outlined text-emerald-600 text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{q.location}</p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-lg sm:text-xl font-black text-[#0F172A] dark:text-white block">
                    ₹{q.unit_price} <span className="text-xs font-normal text-slate-500">/ unit</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Total: ₹{q.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {q.certifications.map((c: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {c}
                  </span>
                ))}
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  ⚡ Lead Time: {q.lead_time_days} Days
                </span>
                {q.sample_available && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    ✓ Sample Available
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                {q.notes}
              </p>

              <div className="flex justify-end pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAccept(q)
                  }}
                  disabled={accepting}
                  className="bg-[#0F172A] hover:bg-[#B5924D] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">handshake</span>
                  <span>{accepting ? 'Accepting Bid...' : 'Accept Quote & Place Order'}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
