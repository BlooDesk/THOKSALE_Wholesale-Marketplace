import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'

export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  const order = {
    id: id || 'TS-20260829-4821',
    created_at: '2026-08-29T14:30:00Z',
    status: 'shipped',
    carrier: 'TCI Freight Logistics Rail (Express Corridor)',
    tracking_number: 'TCI-BLR-9842104',
    seller: {
      display_name: 'TechAudio Manufacturing Ltd',
      city: 'Pune',
      state: 'Maharashtra',
      gstin: '27AABCT9981F1Z2',
    },
    buyer: {
      company_name: 'Apex Retailers & Wholesalers Pvt Ltd',
      full_name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      address: 'Unit 402, Trade Square Logistics Park, Hinjewadi Phase 1, Pune, MH - 411057',
      gstin: '27AABCA1234F1Z5',
    },
    items: [
      {
        id: 'oi-1',
        title: '10000mAh PD Fast Charging Power Bank Type-C Dual Output',
        sku: 'PWR-10K-PD-IND',
        quantity: 50,
        unit: 'pcs',
        unit_price: 850,
        subtotal: 42500,
        hsn: '85076000',
        image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60',
      },
    ],
    subtotal: 42500,
    gst_tax: 7650,
    freight: 0,
    total_amount: 50150,
  }

  const timelineSteps = [
    { label: 'Order Confirmed & Escrow Held', time: 'Aug 29, 02:30 PM', done: true },
    { label: 'Supplier Packaging & Quality Inspection', time: 'Aug 29, 05:45 PM', done: true },
    { label: 'Pallet Dispatched via TCI Freight', time: 'Aug 30, 09:15 AM', done: true },
    { label: 'In Transit — Western Transit Hub (Pune Hub)', time: 'Aug 31, 01:20 PM', current: true },
    { label: 'Out for Delivery to Destination Warehouse', time: 'Est. Sep 01', done: false },
    { label: 'Goods Received & Escrow Settlement', time: 'Pending Delivery', done: false },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Top Breadcrumb & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/orders" className="text-xs font-bold text-slate-500 hover:text-[#0F172A] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>All Orders</span>
            </Link>
            <span className="text-xs text-slate-400">•</span>
            <span className="font-mono text-xs font-bold text-[#0F172A] dark:text-white">#{order.id}</span>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-full uppercase tracking-wider">
            In Transit
          </span>
        </div>

        {/* Live Dispatch Status Hero */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Logistics Carrier & Tracking AWB
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white mt-0.5">
                {order.carrier}
              </h2>
              <p className="font-mono text-xs font-bold text-[#B5924D] mt-0.5">{order.tracking_number}</p>
            </div>
            <button className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>e-Way Bill / Invoice PDF</span>
            </button>
          </div>

          {/* Vertical Dispatch Timeline */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Shipment Timeline</h3>
            <div className="space-y-4 relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  <span
                    className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                      step.done
                        ? 'bg-emerald-600 border-white dark:border-slate-900'
                        : step.current
                        ? 'bg-[#B5924D] border-white dark:border-slate-900 ring-4 ring-[#B5924D]/20 animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-700 border-white dark:border-slate-900'
                    }`}
                  ></span>
                  <p
                    className={`text-xs font-bold ${
                      step.current
                        ? 'text-[#B5924D]'
                        : step.done
                        ? 'text-[#0F172A] dark:text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{step.time}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Itemized Order & Tax Invoice Section */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Itemized Pallet Breakdown</h3>
            <span className="text-xs text-slate-500 font-semibold">Supplier: {order.seller.display_name}</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items.map((it) => (
              <div key={it.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                    <img src={it.image_url} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white line-clamp-1">{it.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      HSN: {it.hsn} • SKU: {it.sku} • {it.quantity} {it.unit} @ ₹{it.unit_price}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                  ₹{it.subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Goods Subtotal</span>
              <span className="font-mono font-semibold">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>GST 18% (Eligible for Input Tax Credit)</span>
              <span className="font-mono font-semibold">₹{order.gst_tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Freight (Consolidated Direct Rail)</span>
              <span className="font-mono font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline text-sm font-extrabold text-[#0F172A] dark:text-white">
              <span>Total Paid</span>
              <span className="font-mono text-base sm:text-lg">₹{order.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </section>

        {/* Delivery Address & Entities */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Consignee (Delivery Address)
            </span>
            <p className="text-xs font-bold text-[#0F172A] dark:text-white">{order.buyer.company_name}</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{order.buyer.address}</p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">GSTIN: {order.buyer.gstin}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Consignor (Supplier)
            </span>
            <p className="text-xs font-bold text-[#0F172A] dark:text-white">{order.seller.display_name}</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              {order.seller.city}, {order.seller.state}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">GSTIN: {order.seller.gstin}</p>
          </div>
        </section>
      </main>

      <StitchBottomNav />
    </div>
  )
}
