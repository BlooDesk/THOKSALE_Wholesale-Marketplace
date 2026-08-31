import Link from 'next/link'
import type { ReactNode } from 'react'

export function SellerShell({ children, currentPath }: { children: ReactNode; currentPath?: string }) {
  const nav = [
    { href: '/seller', label: 'Dashboard', icon: 'dashboard' },
    { href: '/seller/products', label: 'Products', icon: 'inventory_2' },
    { href: '/seller/inventory', label: 'Inventory', icon: 'warehouse' },
    { href: '/seller/orders', label: 'Dispatches', icon: 'local_shipping' },
    { href: '/seller/rfq', label: 'RFQ Bids', icon: 'request_quote' },
    { href: '/seller/company-profile', label: 'Factory KYC', icon: 'verified' },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 font-sans">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/seller" className="flex items-center gap-1.5">
              <span className="font-mono text-xl font-black tracking-tight text-[#0F172A] dark:text-white">
                THOK<span className="text-[#B5924D]">SALE</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#B5924D]/15 text-[#775a1a] dark:text-[#B5924D] px-2 py-0.5 rounded ml-1">
                Factory Console
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#0F172A] px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              <span className="hidden sm:inline">Buyer Marketplace</span>
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-xs font-bold text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 pb-2 scrollbar-none">
          {nav.map((n) => {
            const active = currentPath && (currentPath === n.href || (n.href !== '/seller' && currentPath.startsWith(n.href)))
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0F172A]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-28">{children}</main>
    </div>
  )
}
