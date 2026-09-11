import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { AccountSignOutButton } from './sign-out-btn'
import { getBuyerOrderStats } from '@/services/order.service'
import { getKycBadge } from '@/services/profile.service'

export const dynamic = 'force-dynamic'

const ACCOUNT_NAV = [
  { href: '/orders',               icon: 'inventory_2',          label: 'My Orders',       sub: 'Track & manage orders' },
  { href: '/account/invoices',     icon: 'receipt_long',         label: 'Invoices',         sub: 'GST-compliant invoices' },
  { href: '/account/wallet',       icon: 'account_balance_wallet', label: 'Promo Wallet',   sub: 'Credits & rewards' },
  { href: '/rfq',                  icon: 'request_quote',        label: 'My RFQs',          sub: 'Quote requests' },
  { href: '/account/business',     icon: 'business',             label: 'Business Profile', sub: 'Company & KYC details' },
  { href: '/account/applications', icon: 'description',          label: 'Applications',     sub: 'Seller & credit apps' },
  { href: '/account/addresses',    icon: 'location_on',          label: 'Addresses',        sub: 'Delivery addresses' },
  { href: '/notifications',        icon: 'notifications',        label: 'Notifications',    sub: 'Alerts & updates' },
]

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account')
  }

  const [profileRes, companyRes, ordersRes, notifsRes] = await Promise.allSettled([
    supabase.from('profiles').select('id, full_name, phone, role, avatar_url').eq('id', user.id).maybeSingle(),
    supabase.from('company_profiles').select('id, display_name, legal_name, kyc_status, city, state, tax_id').eq('profile_id', user.id).maybeSingle(),
    getBuyerOrderStats(user.id),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
  ])

  const profile  = profileRes.status  === 'fulfilled' ? profileRes.value.data  : null
  const company  = companyRes.status  === 'fulfilled' ? companyRes.value.data  : null
  const orders   = ordersRes.status   === 'fulfilled' ? ordersRes.value        : { total: 0, active: 0, completed: 0 }
  const unread   = notifsRes.status   === 'fulfilled' ? (notifsRes.value.count ?? 0) : 0

  const fullName     = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Wholesale Member'
  const email        = user.email ?? ''
  const phone        = profile?.phone || user.user_metadata?.phone || ''
  const businessName = company?.display_name || company?.legal_name || user.user_metadata?.company_name || null
  const kyc          = getKycBadge(company?.kyc_status ?? 'pending')
  const role         = profile?.role || user.user_metadata?.role || 'buyer'
  const location     = [company?.city, company?.state].filter(Boolean).join(', ')
  const isKycVerified = company?.kyc_status === 'verified'

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0A0D14] text-[#0F172A] dark:text-slate-100 font-sans">
      <StitchHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-24 flex flex-col gap-4">

        {/* ── Profile Card ──────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-[#0F172A] via-[#162032] to-[#1e293b] rounded-3xl px-5 pt-5 pb-4 shadow-lg relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#B5924D]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 w-64 h-20 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

          {/* Avatar + Info */}
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#B5924D]/20 border-2 border-[#B5924D]/30 flex items-center justify-center font-black text-2xl text-[#B5924D] flex-shrink-0 select-none">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h1 className="text-base sm:text-lg font-extrabold text-white truncate leading-tight">{fullName}</h1>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{email}</p>
              {phone && <p className="text-[11px] text-slate-400 mt-0.5">{phone}</p>}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {/* Role badge */}
                <span className="inline-flex items-center gap-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                  <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {role === 'seller' ? 'factory' : 'shopping_bag'}
                  </span>
                  {role === 'seller' ? 'Seller' : 'Buyer'}
                </span>
                {/* KYC badge */}
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isKycVerified
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/20'
                    : 'bg-amber-600/20 text-amber-300 border-amber-500/20'
                }`}>
                  <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isKycVerified ? 'verified' : 'hourglass_empty'}
                  </span>
                  {kyc.label}
                </span>
              </div>
            </div>
            <Link
              href="/account/business"
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors mt-0.5"
              title="Edit Profile"
            >
              <span className="material-symbols-outlined text-white text-[17px]">edit</span>
            </Link>
          </div>

          {/* Business info row */}
          <div className="relative mt-4 pt-3.5 border-t border-white/10 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[16px] text-slate-400 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              business
            </span>
            <div className="flex-1 min-w-0">
              {businessName ? (
                <>
                  <p className="text-sm font-bold text-white truncate">{businessName}</p>
                  {location && <p className="text-[11px] text-slate-400">{location}</p>}
                </>
              ) : (
                <Link href="/account/business" className="text-sm font-bold text-[#B5924D] hover:underline">
                  + Register Your Business
                </Link>
              )}
            </div>
            {company?.tax_id && (
              <span className="flex-shrink-0 text-[9px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg hidden sm:block">
                GSTIN: {company.tax_id}
              </span>
            )}
          </div>
        </section>

        {/* ── Stats Row ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Orders',  value: orders.total,     icon: 'inventory_2',     color: 'text-indigo-500 dark:text-indigo-400',  bg: 'bg-indigo-50  dark:bg-indigo-950/40' },
            { label: 'Active',        value: orders.active,    icon: 'pending_actions',  color: 'text-amber-500  dark:text-amber-400',   bg: 'bg-amber-50   dark:bg-amber-950/40'  },
            { label: 'Completed',     value: orders.completed, icon: 'task_alt',         color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
          ].map((s) => (
            <Link
              key={s.label}
              href="/orders"
              className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#B5924D]/40 hover:shadow-md transition-all text-center active:scale-95"
            >
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <span className={`material-symbols-outlined text-[20px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {s.icon}
                </span>
              </div>
              <div className="text-xl font-black text-[#0F172A] dark:text-white tabular-nums">{s.value}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-tight">{s.label}</div>
            </Link>
          ))}
        </section>

        {/* ── Navigation Menu ───────────────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {ACCOUNT_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-[#B5924D]/10 transition-colors">
                  <span
                    className="material-symbols-outlined text-[18px] text-slate-500 dark:text-slate-400 group-hover:text-[#B5924D] transition-colors"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#0F172A] dark:text-white">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.sub}</div>
                </div>
                {/* Notification badge */}
                {item.href === '/notifications' && unread > 0 && (
                  <span className="flex-shrink-0 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
                <span className="material-symbols-outlined text-[18px] text-slate-300 dark:text-slate-700 group-hover:text-[#B5924D] group-hover:translate-x-0.5 transition-all flex-shrink-0">
                  chevron_right
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Sell on THOKSALE CTA ──────────────────────────────────────── */}
        {(role === 'buyer' || role === 'admin') && (
          <section className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/30 p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[22px] text-indigo-600 dark:text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                storefront
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200 leading-tight">Want to sell on THOKSALE?</p>
              <p className="text-[11px] text-indigo-500 dark:text-indigo-400 mt-0.5">Apply to become a verified supplier</p>
            </div>
            <Link
              href="/account/applications"
              className="flex-shrink-0 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl transition-colors shadow-sm"
            >
              Apply
            </Link>
          </section>
        )}

        {/* ── Sign Out ──────────────────────────────────────────────────── */}
        <AccountSignOutButton />

      </main>

      <StitchBottomNav />
    </div>
  )
}
