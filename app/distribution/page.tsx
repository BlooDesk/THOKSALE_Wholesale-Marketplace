import Link from 'next/link'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'

const OPPORTUNITIES = [
  {
    id: 'lumina-electricals',
    brand_name: 'Lumina Commercial Electricals Ltd',
    category: 'Commercial LED & Switchgears',
    state: 'Maharashtra / Karnataka',
    available_districts: 'Pune, Nagpur, Nashik, Belagavi',
    margin: '18% - 24%',
    min_investment: '₹5,00,000',
    exclusive_territory: true,
    description: 'Leading OEM commercial lighting manufacturer expanding district dealership network across Tier 1 & 2 industrial zones.',
    logo_letter: 'L',
    verified: true,
  },
  {
    id: 'aarav-industrial',
    brand_name: 'Aarav Fasteners & Precision Tools',
    category: 'Industrial Hardware & Pneumatics',
    state: 'Gujarat / Maharashtra',
    available_districts: 'Surat, Rajkot, Ahmedabad, Thane',
    margin: '15% - 20%',
    min_investment: '₹3,50,000',
    exclusive_territory: true,
    description: 'Direct manufacturer of industrial fasteners, pneumatic valves, and high-tensile bearings looking for city stockists.',
    logo_letter: 'A',
    verified: true,
  },
  {
    id: 'tiruppur-knits',
    brand_name: 'Tiruppur Organic Knits & Fabrics',
    category: 'Textiles & Apparel Sourcing',
    state: 'Tamil Nadu / Andhra Pradesh',
    available_districts: 'Coimbatore, Madurai, Vijayawada',
    margin: '22% - 28%',
    min_investment: '₹4,00,000',
    exclusive_territory: true,
    description: 'Organic combed cotton knit fabric mill appointing authorized regional stockists for garment manufacturing clusters.',
    logo_letter: 'T',
    verified: true,
  },
]

export default function DistributionPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Title */}
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5924D]">Direct Trade Franchises</span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight mt-0.5">
              Brand Distribution & Dealership Opportunities
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Secure authorized regional distribution rights directly from top manufacturing brands.
            </p>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OPPORTUNITIES.map((opp) => (
            <div
              key={opp.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#B5924D] transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-lg border border-[#B5924D]/30">
                      {opp.logo_letter}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">{opp.brand_name}</h3>
                        <span
                          className="material-symbols-outlined text-emerald-600 text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{opp.category}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {opp.description}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Trade Margin</span>
                    <span className="font-bold text-emerald-600">{opp.margin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Min. Working Capital</span>
                    <span className="font-mono font-bold text-[#0F172A] dark:text-white">{opp.min_investment}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Open Territories</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{opp.available_districts}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/distribution/${opp.id}`}
                  className="w-full bg-[#0F172A] hover:bg-[#B5924D] text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <span>View Territory Prospectus & Apply</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
