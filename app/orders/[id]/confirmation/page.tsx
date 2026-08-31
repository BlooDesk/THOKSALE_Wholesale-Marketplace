import Link from 'next/link'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'

export default async function OrderConfirmationPage(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ amount?: string }>
}) {
  const { id } = await props.params
  const sp = await props.searchParams
  const amount = sp.amount ? parseFloat(sp.amount) : 50150

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Success Tick & Hero */}
        <section className="flex flex-col items-center justify-center text-center py-4 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mb-3 ring-8 ring-emerald-50 dark:ring-emerald-900/20">
            <span
              className="material-symbols-outlined text-emerald-600 text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight mb-1">
            Wholesale Order Confirmed
          </h1>
          <p className="text-xs text-slate-500 max-w-sm">
            Payment deposited into verified Escrow. Order has been transmitted to the supplier warehouse for pallet dispatch.
          </p>
        </section>

        {/* Order Details & Summary Card */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Order Reference</span>
              <span className="font-mono text-sm font-bold text-[#0F172A] dark:text-white">#{id}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Paid (Escrow)</span>
              <span className="font-mono text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Estimated Dispatch:</span>
              <span className="font-semibold text-[#0F172A] dark:text-white">Within 24-48 Hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Delivery Method:</span>
              <span className="font-semibold text-[#0F172A] dark:text-white">Standard Surface Direct Rail</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Tax Invoice / e-Way:</span>
              <span className="text-emerald-600 font-semibold">Generating on pallet pickup</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/orders/${id}`}
              className="flex-1 bg-[#0F172A] text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              <span>Track Live Dispatch</span>
            </Link>
            <Link
              href="/products"
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-slate-200 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>
        </section>
      </main>

      <StitchBottomNav />
    </div>
  )
}
