import Link from 'next/link'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'

export default function ApplicationsPage() {
  const applications = [
    {
      id: 'APP-LUM-202601',
      brand_name: 'Lumina Commercial Electricals Ltd',
      territory: 'Pune Urban & Rural District (MH)',
      investment: '₹5,00,000 - ₹10,00,000',
      status: 'under_review',
      status_label: 'Under Brand Review',
      submitted_at: 'Aug 30, 2026',
      notes: 'Brand commercial manager scheduled regional verification call for Sep 02, 2026.',
    },
    {
      id: 'APP-AAR-202609',
      brand_name: 'Aarav Fasteners & Precision Tools',
      territory: 'Thane & Navi Mumbai Industrial Zone',
      investment: '₹3,50,000',
      status: 'approved',
      status_label: 'Application Approved (Contract Ready)',
      submitted_at: 'Aug 18, 2026',
      notes: 'Territory MOU approved with 18% standard dealer margin. Please review digital agreement.',
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
          <span className="text-xs font-bold text-[#0F172A] dark:text-white">Dealership Applications</span>
        </div>

        {/* Title */}
        <div className="flex justify-between items-baseline">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              My Dealership Applications
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Status of submitted brand distributorship applications and contracts.
            </p>
          </div>
          <Link href="/distribution" className="text-xs font-bold text-[#B5924D] hover:underline">
            + Explore Brands
          </Link>
        </div>

        {/* Applications List */}
        <div className="flex flex-col gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Application ID: {app.id} • Submitted {app.submitted_at}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white mt-0.5">
                    {app.brand_name}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    app.status === 'approved'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {app.status_label}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Applied Territory:</span>
                  <span className="font-bold text-[#0F172A] dark:text-white">{app.territory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Committed Capital:</span>
                  <span className="font-mono font-bold text-[#0F172A] dark:text-white">{app.investment}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                  {app.notes}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <StitchBottomNav />
    </div>
  )
}
