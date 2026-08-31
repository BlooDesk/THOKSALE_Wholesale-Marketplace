import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { DistributionApplyClient } from './apply-client'

export default async function DistributionDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  const details: any = {
    'lumina-electricals': {
      id: 'lumina-electricals',
      brand_name: 'Lumina Commercial Electricals Ltd',
      category: 'Commercial LED & Industrial Switchgears',
      state: 'Maharashtra / Karnataka',
      established: '2014',
      factory_location: 'Pune Industrial Corridor (MIDC Chakan)',
      margin_structure: '18% Standard Dealership • 24% Regional Super-Stockist',
      min_investment: '₹5,00,000 Working Capital',
      exclusive_territory: 'Guaranteed 25km Exclusive Pincode Radius',
      support_provided: [
        'Free showroom display units & illuminated brand signage',
        'Direct billing software integration with THOKSALE ERP rail',
        'Co-funded regional print & digital trade advertising (50%)',
        '30-Day revolving trade credit line on secondary dispatches',
      ],
      description:
        'Lumina Electricals is an ISO 9001 certified manufacturer of premium architectural LED luminaires, explosion-proof industrial fittings, and commercial distribution boards. We are currently inviting applications for exclusive district distributorships across Western & Southern India.',
    },
  }

  const opp = details[id] || details['lumina-electricals']

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/distribution" className="text-xs font-bold text-slate-500 hover:text-[#0F172A] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>All Opportunities</span>
          </Link>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-bold text-[#0F172A] dark:text-white">{opp.brand_name}</span>
        </div>

        {/* Brand Banner Hero */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-2xl border border-[#B5924D]/40">
                L
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">{opp.brand_name}</h1>
                  <span
                    className="material-symbols-outlined text-emerald-600 text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold">{opp.category} • Est. {opp.established}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[12px]">factory</span>
                  {opp.factory_location}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
            {opp.description}
          </p>
        </section>

        {/* Commercial Terms & Margins */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Commercial Dealership Structure</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Trade Commission</span>
              <span className="font-bold text-emerald-600 text-sm mt-0.5 block">{opp.margin_structure}</span>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Capital Requirement</span>
              <span className="font-mono font-bold text-[#0F172A] dark:text-white text-sm mt-0.5 block">{opp.min_investment}</span>
            </div>
            <div className="sm:col-span-2 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Territory Exclusivity</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">{opp.exclusive_territory}</span>
            </div>
          </div>
        </section>

        {/* Brand Support Provided */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Brand Support Package</h2>
          <div className="space-y-2">
            {opp.support_provided.map((s: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Application Form Component */}
        <DistributionApplyClient brandName={opp.brand_name} />
      </main>

      <StitchBottomNav />
    </div>
  )
}
