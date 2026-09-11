import Link from 'next/link'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'

export default function WalletPage() {
  const transactions = [
    {
      id: 'TXN-9481',
      title: 'Trade Credit Utilized for Order #TS-20260829-4821',
      date: 'Aug 29, 2026',
      amount: -50150,
      type: 'debit',
    },
    {
      id: 'TXN-9104',
      title: 'Wholesale Volume Cashback Reward (2%)',
      date: 'Aug 24, 2026',
      amount: 226,
      type: 'credit',
    },
    {
      id: 'TXN-8840',
      title: 'Pre-Approved Trade Credit Line Sanctioned (HDFC Escrow)',
      date: 'Aug 01, 2026',
      amount: 500000,
      type: 'limit_credit',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-24 md:pb-8 font-sans">
      <StitchHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/account" className="text-xs font-bold text-slate-500 hover:text-[#0F172A] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Account Hub</span>
          </Link>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-bold text-[#0F172A] dark:text-white">Trade Credit Wallet</span>
        </div>

        {/* Title */}
        <div className="flex justify-between items-baseline">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Trade Credit & Promo Wallet
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              PayLater 30-day revolving credit line and wholesale rewards.
            </p>
          </div>
        </div>

        {/* Credit Limit Card (Gold Gradient) */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#B5924D]/15 rounded-bl-full -z-0"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5924D]">
                  Pre-Approved B2B Credit Line
                </span>
                <p className="font-mono text-2xl sm:text-3xl font-black text-white mt-1">
                  ₹4,49,850 <span className="text-xs font-medium text-slate-400">Available</span>
                </p>
              </div>
              <span className="material-symbols-outlined text-[#B5924D] text-3xl">credit_score</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-white/10">
              <span>Total Sanctioned Limit: ₹5,00,000</span>
              <span className="text-emerald-400 font-bold">0% Interest (30 Days)</span>
            </div>

            <div className="flex gap-2 pt-1">
              <button className="flex-1 bg-[#B5924D] hover:bg-[#96773a] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs">
                Request Limit Enhancement
              </button>
            </div>
          </div>
        </div>

        {/* Promo Rewards & Active Coupons */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Trade Coupons</h2>
            <span className="text-xs font-bold text-amber-600">14,200 Cashback Coins</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-white">FIRSTB2B</span>
                <span className="text-[10px] font-bold text-emerald-600">₹2,500 OFF</span>
              </div>
              <p className="text-[11px] text-slate-500">Valid on your first wholesale order above ₹25,000</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-white">FREIGHTFREE</span>
                <span className="text-[10px] font-bold text-emerald-600">100% OFF FREIGHT</span>
              </div>
              <p className="text-[11px] text-slate-500">Full truckload surface freight waiver across India</p>
            </div>
          </div>
        </section>

        {/* Ledger Transaction History */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Statement Ledger</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">{tx.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {tx.date} • Ref: {tx.id}
                  </p>
                </div>
                <span
                  className={`font-mono text-xs sm:text-sm font-bold ${
                    tx.type === 'debit'
                      ? 'text-red-600'
                      : tx.type === 'limit_credit'
                      ? 'text-[#B5924D]'
                      : 'text-emerald-600'
                  }`}
                >
                  {tx.amount > 0 ? `+₹${tx.amount.toLocaleString('en-IN')}` : `–₹${Math.abs(tx.amount).toLocaleString('en-IN')}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <StitchBottomNav />
    </div>
  )
}
