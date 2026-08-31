import Link from 'next/link'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'

export default function InvoicesPage() {
  const invoices = [
    {
      id: 'INV-2026-0842',
      order_id: 'TS-20260829-4821',
      date: 'Aug 29, 2026',
      supplier: 'TechAudio Manufacturing Ltd',
      gstin: '27AABCT9981F1Z2',
      taxable_amount: 42500,
      gst_amount: 7650,
      total_amount: 50150,
      status: 'paid',
      itc_eligible: true,
    },
    {
      id: 'INV-2026-0711',
      order_id: 'TS-20260821-3109',
      date: 'Aug 21, 2026',
      supplier: 'Apex Tape Mills & Packaging',
      gstin: '24AABCA9182C1Z1',
      taxable_amount: 9600,
      gst_amount: 1728,
      total_amount: 11328,
      status: 'paid',
      itc_eligible: true,
    },
    {
      id: 'INV-2026-0640',
      order_id: 'TS-20260814-1920',
      date: 'Aug 14, 2026',
      supplier: 'SteelMax Fasteners & Bearings',
      gstin: '03AABCS8819A1Z9',
      taxable_amount: 24000,
      gst_amount: 4320,
      total_amount: 28320,
      status: 'paid',
      itc_eligible: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/account" className="text-xs font-bold text-slate-500 hover:text-[#0F172A] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Account Hub</span>
          </Link>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-bold text-[#0F172A] dark:text-white">Tax Invoices</span>
        </div>

        {/* Title */}
        <div className="flex justify-between items-baseline">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              GST Tax Invoices & ITC
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              GSTR-2B reconciled tax invoices with digital signatures.
            </p>
          </div>
        </div>

        {/* Invoice Summary Cards */}
        <div className="flex flex-col gap-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-[#0F172A] dark:text-white">{inv.id}</span>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded uppercase">
                    ITC Eligible
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{inv.supplier}</p>
                <p className="text-[11px] text-slate-500">
                  GSTIN: {inv.gstin} • Date: {inv.date} • Order: #{inv.order_id}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="font-mono text-base font-black text-[#0F172A] dark:text-white block">
                    ₹{inv.total_amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    GST: ₹{inv.gst_amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <Link
                  href={`/account/invoices/${inv.id}`}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[15px]">description</span>
                  <span>View Tax Invoice</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <StitchBottomNav />
    </div>
  )
}
