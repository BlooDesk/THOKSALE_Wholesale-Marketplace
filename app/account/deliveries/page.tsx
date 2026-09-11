import Link from 'next/link'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'

export default function DeliveriesPage() {
  const deliveries = [
    {
      id: 'DEL-94821',
      order_id: 'TS-20260829-4821',
      carrier: 'TCI Freight Logistics Rail (Express Corridor)',
      awb: 'TCI-BLR-9842104',
      status: 'in_transit',
      status_label: 'In Transit — Western Transit Hub (Pune)',
      progress: 65,
      destination: 'Apex Warehouse 2, Hinjewadi, Pune (PIN 411057)',
      estimated_delivery: 'Tomorrow, Sep 01, 2026',
      supplier: 'TechAudio Manufacturing Ltd',
      items_summary: '50x 10000mAh PD Fast Charging Power Bank Type-C',
    },
    {
      id: 'DEL-81042',
      order_id: 'TS-20260821-3109',
      carrier: 'V-Trans Logistics Surface Rail',
      awb: 'VTR-SRT-440192',
      status: 'delivered',
      status_label: 'Delivered & Pod Signed',
      progress: 100,
      destination: 'Apex Warehouse 1, Swargate, Pune (PIN 411002)',
      estimated_delivery: 'Delivered on Aug 23, 2026',
      supplier: 'Apex Tape Mills & Packaging',
      items_summary: '300x Heavy Duty 2-inch Packaging Bopp Tape 65m',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-24 md:pb-8 font-sans">
      <StitchHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/account" className="text-xs font-bold text-slate-500 hover:text-[#0F172A] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Account Hub</span>
          </Link>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-bold text-[#0F172A] dark:text-white">Deliveries & Freight</span>
        </div>

        {/* Title */}
        <div className="flex justify-between items-baseline">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Deliveries & Logistics Tracker
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Live consolidated freight movements and electronic Proof of Delivery (e-PoD).
            </p>
          </div>
        </div>

        {/* Active Shipments Cards */}
        <div className="flex flex-col gap-4">
          {deliveries.map((del) => (
            <div
              key={del.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Shipment #{del.id} • Order #{del.order_id}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white mt-0.5">
                    {del.supplier}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    del.status === 'delivered'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {del.status === 'delivered' ? '✓ Delivered' : '⚡ In Transit'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-[#0F172A] dark:text-white">{del.status_label}</span>
                  <span className="text-slate-500">{del.estimated_delivery}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${del.status === 'delivered' ? 'bg-emerald-600' : 'bg-[#B5924D]'}`}
                    style={{ width: `${del.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Freight Details */}
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Carrier & AWB:</span>
                  <span className="font-mono font-bold text-[#0F172A] dark:text-white">
                    {del.carrier} ({del.awb})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Manifest Cargo:</span>
                  <span className="font-medium text-[#0F172A] dark:text-white truncate max-w-[280px]">
                    {del.items_summary}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Destination:</span>
                  <span className="font-medium text-[#0F172A] dark:text-white truncate max-w-[280px]">
                    {del.destination}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Link
                  href={`/orders/${del.order_id}`}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">search</span>
                  <span>View Full Order Detail</span>
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
