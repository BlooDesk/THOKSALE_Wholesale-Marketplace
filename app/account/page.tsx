import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { AccountSignOutButton } from './sign-out-btn'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account')
  }

  let profile: any = null
  let company: any = null

  const [{ data: p }, { data: cp }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, phone, status').eq('id', user.id).maybeSingle(),
    supabase.from('company_profiles').select('*').eq('profile_id', user.id).maybeSingle(),
  ])
  profile = p
  company = cp

  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Wholesale Member'
  const email = user.email || ''
  const phone = profile?.phone || user.user_metadata?.phone || 'Not registered'
  const businessName = company?.display_name || company?.legal_name || user.user_metadata?.company_name || 'Registered Wholesale Entity'
  const role = (user.user_metadata?.role as string) || 'buyer'

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-5">
        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Account & Business Hub
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Manage corporate identity, GST tax details, orders, and credit limits.
          </p>
        </div>

        {/* Identity Card */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-xl shrink-0 border border-[#B5924D]/40">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white truncate">{fullName}</h2>
              <span
                className="material-symbols-outlined text-emerald-600 text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}
                title="KYC Verified"
              >
                verified
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">{businessName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#B5924D]/15 text-[#775a1a] dark:text-[#B5924D]">
                {role === 'seller' ? 'Verified Manufacturer' : 'Wholesale Buyer'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">UID: {user.id.slice(0, 8)}</span>
            </div>
          </div>
        </section>

        {/* Quick KPI Stat Pills */}
        <section className="grid grid-cols-3 gap-3">
          <Link
            href="/orders"
            className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs text-center hover:border-[#B5924D] transition-colors"
          >
            <span className="font-mono text-base sm:text-lg font-extrabold text-[#0F172A] dark:text-white block">
              3
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Orders</span>
          </Link>

          <Link
            href="/rfq"
            className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs text-center hover:border-[#B5924D] transition-colors"
          >
            <span className="font-mono text-base sm:text-lg font-extrabold text-[#0F172A] dark:text-white block">
              4
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">RFQs</span>
          </Link>

          <Link
            href="/account/wallet"
            className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs text-center hover:border-[#B5924D] transition-colors"
          >
            <span className="font-mono text-base sm:text-lg font-extrabold text-[#B5924D] block">
              ₹5.0L
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Trade Credit</span>
          </Link>
        </section>

        {/* Navigation Modules List */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          <Link
            href="/account/business"
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-[#B5924D]/15 group-hover:text-[#775a1a] transition-colors">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                  Corporate Profile & GSTIN
                </h3>
                <p className="text-[11px] text-slate-500">Registered entity, PAN, and billing address</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
          </Link>

          <Link
            href="/account/deliveries"
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-[#B5924D]/15 group-hover:text-[#775a1a] transition-colors">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                  Deliveries & Freight Tracker
                </h3>
                <p className="text-[11px] text-slate-500">Live multi-carrier logistics tracking & AWBs</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
          </Link>

          <Link
            href="/account/invoices"
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-[#B5924D]/15 group-hover:text-[#775a1a] transition-colors">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                  Tax Invoices & GST ITC
                </h3>
                <p className="text-[11px] text-slate-500">GSTR-2B reconciled tax invoices and downloads</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
          </Link>

          <Link
            href="/account/wallet"
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-[#B5924D]/15 group-hover:text-[#775a1a] transition-colors">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                  Trade Credit & Promo Wallet
                </h3>
                <p className="text-[11px] text-slate-500">Revolving credit lines and promotional coins</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
          </Link>

          <Link
            href="/distribution"
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-[#B5924D]/15 group-hover:text-[#775a1a] transition-colors">
                <span className="material-symbols-outlined text-[20px]">handshake</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                  Dealership Opportunities
                </h3>
                <p className="text-[11px] text-slate-500">Exclusive regional territory dealerships</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
          </Link>

          <Link
            href="/account/applications"
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-[#B5924D]/15 group-hover:text-[#775a1a] transition-colors">
                <span className="material-symbols-outlined text-[20px]">assignment</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                  My Dealership Applications
                </h3>
                <p className="text-[11px] text-slate-500">Track pending brand partnership agreements</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
          </Link>
        </section>

        {/* Sign Out Button */}
        <div className="pt-2">
          <AccountSignOutButton />
        </div>
      </main>

      <StitchBottomNav />
    </div>
  )
}
