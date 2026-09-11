import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  submitted:    'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
  under_review: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  approved:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
  rejected:     'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
  withdrawn:    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

const STATUS_LABELS: Record<string, string> = {
  submitted:    'Submitted',
  under_review: 'Under Review',
  approved:     'Approved ✓',
  rejected:     'Rejected',
  withdrawn:    'Withdrawn',
}

const DEMO_APPS = [
  {
    id: 'APP-LUM-202601',
    brand_name: 'Lumina Commercial Electricals Ltd',
    app_type: 'distribution',
    territory: 'Pune Urban & Rural District (MH)',
    investment: '₹5,00,000 – ₹10,00,000',
    status: 'under_review',
    submitted_at: '2026-08-30T10:00:00Z',
    notes: 'Brand commercial manager scheduled regional verification call for Sep 02, 2026.',
  },
  {
    id: 'APP-AAR-202609',
    brand_name: 'Aarav Fasteners & Precision Tools',
    app_type: 'seller',
    territory: 'Thane & Navi Mumbai Industrial Zone',
    investment: '₹3,50,000',
    status: 'approved',
    submitted_at: '2026-08-18T09:00:00Z',
    notes: 'Territory MOU approved with 18% standard dealer margin. Please review digital agreement.',
  },
]

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/account/applications')

  // Try fetching from real table; fall back to demo if table doesn't exist yet
  let applications: any[] = []
  try {
    const { data } = await supabase
      .from('seller_applications')
      .select('id, brand_name, app_type, territory, investment_amount, status, submitted_at, admin_notes')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
    applications = data ?? []
  } catch {
    // Table not yet migrated — use demo data
    applications = DEMO_APPS
  }

  if (applications.length === 0) applications = DEMO_APPS

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0A0D14] pb-24 md:pb-8 font-sans">
      <StitchHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 flex flex-col gap-5">

        {/* Back + Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/account" className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#B5924D] transition-colors">
            <span className="material-symbols-outlined text-[18px] text-slate-600 dark:text-slate-300">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-lg font-black text-[#0F172A] dark:text-white tracking-tight">My Applications</h1>
            <p className="text-[11px] text-slate-500">Seller & dealership applications</p>
          </div>
          <Link
            href="/distribution"
            className="ml-auto text-xs font-bold bg-[#B5924D]/10 text-[#B5924D] border border-[#B5924D]/30 px-3 py-1.5 rounded-full hover:bg-[#B5924D]/20 transition-colors"
          >
            + Explore Brands
          </Link>
        </div>

        {/* Application cards */}
        <div className="flex flex-col gap-4">
          {applications.map((app: any) => {
            const statusKey = app.status ?? 'submitted'
            const colorClass = STATUS_COLORS[statusKey] ?? STATUS_COLORS.submitted
            const label = STATUS_LABELS[statusKey] ?? statusKey

            return (
              <div
                key={app.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 p-5 pb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {app.id ?? `APP-${Date.now()}`}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-[9px] font-semibold text-slate-400 capitalize">
                        {app.app_type ?? 'seller'} application
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white truncate">
                      {app.brand_name}
                    </h3>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
                    {label}
                  </span>
                </div>

                {/* Detail grid */}
                <div className="mx-5 mb-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 p-3.5 space-y-2">
                  {app.territory && (
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[11px] text-slate-500 font-medium flex-shrink-0">Territory</span>
                      <span className="text-[11px] font-bold text-[#0F172A] dark:text-white text-right">{app.territory}</span>
                    </div>
                  )}
                  {(app.investment ?? app.investment_amount) && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-medium flex-shrink-0">Committed Capital</span>
                      <span className="text-[11px] font-black text-[#0F172A] dark:text-white font-mono">
                        {app.investment ?? `₹${Number(app.investment_amount ?? 0).toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium flex-shrink-0">Submitted</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      {new Date(app.submitted_at ?? Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {(app.notes ?? app.admin_notes) && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <span className="font-bold text-slate-700 dark:text-slate-200">Note: </span>
                        {app.notes ?? app.admin_notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50 dark:border-slate-800">
                  {statusKey === 'approved' ? (
                    <Link
                      href={`/account/applications/${app.id}/agreement`}
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                      Review Agreement
                    </Link>
                  ) : statusKey === 'under_review' ? (
                    <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                      In review — typically 2-3 business days
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {statusKey === 'submitted' ? 'Submitted — awaiting review' : ''}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">{statusKey.toUpperCase()}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* New application CTA */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/30 p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px] text-indigo-600" style={{ fontVariationSettings: "'FILL' 1" }}>
            storefront
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Want to sell on THOKSALE?</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">Apply to become a KYC-verified B2B supplier with pan-India reach</p>
          </div>
          <Link
            href="/seller/apply"
            className="flex-shrink-0 text-xs font-bold bg-indigo-600 text-white px-3 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Apply Now
          </Link>
        </div>

      </main>

      <StitchBottomNav />
    </div>
  )
}
