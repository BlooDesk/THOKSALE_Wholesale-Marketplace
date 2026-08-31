import Link from 'next/link'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { RfqQuotesClient } from './rfq-quotes-client'

export default async function RfqDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  const rfq = {
    id: id || 'RFQ-2026-0914',
    title: 'Custom Branded 20W PD Fast Chargers with Type-C Braided Cables',
    category: 'Consumer Electronics & Mobile Accessories',
    quantity: 2500,
    unit: 'Units',
    target_price: 220,
    created_at: '29-Aug-2026',
    delivery_pincode: '411057 (Pune Warehouse 2)',
    specifications:
      'Must have BIS certificate R-84920194. Dual output Type-C + USB-A. Laser engraved custom company logo on top plate. White matte finish with individual master export cartons.',
    quotes: [
      {
        id: 'QUOTE-01',
        supplier_name: 'TechAudio Manufacturing Ltd',
        location: 'Pune, Maharashtra',
        verified: true,
        unit_price: 195,
        total_amount: 487500,
        lead_time_days: 12,
        sample_available: true,
        certifications: ['BIS Certified', 'ISO 9001:2015', 'RoHS Compliant'],
        notes: 'Includes customized laser branding & master carton packaging. Direct dispatch from Chakan MIDC factory.',
      },
      {
        id: 'QUOTE-02',
        supplier_name: 'ElectroCraft Electronics India',
        location: 'Noida, Uttar Pradesh',
        verified: true,
        unit_price: 210,
        total_amount: 525000,
        lead_time_days: 15,
        sample_available: true,
        certifications: ['BIS Certified', 'CE Approved'],
        notes: 'Samples can be air-shipped within 48 hours for batch inspection.',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/rfq" className="text-xs font-bold text-slate-500 hover:text-[#0F172A] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>RFQ Workspace</span>
          </Link>
          <span className="text-xs text-slate-400">•</span>
          <span className="font-mono text-xs font-bold text-[#0F172A] dark:text-white">#{rfq.id}</span>
        </div>

        {/* RFQ Overview Card */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5924D]">
              {rfq.category}
            </span>
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full uppercase">
              Bidding Open ({rfq.quotes.length} Quotes)
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">{rfq.title}</h1>

          {/* Sourcing Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Quantity</span>
              <span className="font-bold text-[#0F172A] dark:text-white">{rfq.quantity} {rfq.unit}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Target Price</span>
              <span className="font-mono font-bold text-[#0F172A] dark:text-white">₹{rfq.target_price} / {rfq.unit}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Delivery Hub</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{rfq.delivery_pincode}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Posted Date</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{rfq.created_at}</span>
            </div>
          </div>

          <div className="text-xs space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Specifications</span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{rfq.specifications}</p>
          </div>
        </section>

        {/* Quotes Received Comparison */}
        <RfqQuotesClient quotes={rfq.quotes} rfqId={rfq.id} />
      </main>

      <StitchBottomNav />
    </div>
  )
}
