'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/',         icon: 'home',          label: 'Home',    exact: true  },
  { href: '/products', icon: 'storefront',    label: 'Catalog', exact: false },
  { href: '/rfq/new',  icon: 'request_quote', label: 'RFQ',     exact: false },
  { href: '/orders',   icon: 'inventory_2',   label: 'Orders',  exact: false },
  { href: '/account',  icon: 'person',        label: 'Account', exact: false },
]

export function StitchBottomNav() {
  const pathname = usePathname()

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href)
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-1" style={{ height: '56px' }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-xl transition-all duration-150 ${
                active ? 'text-[#B5924D]' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <span
                className={`material-symbols-outlined transition-all duration-150 ${
                  active ? 'text-[24px]' : 'text-[22px]'
                }`}
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span
                className={`text-[9px] font-bold tracking-tight leading-none transition-all ${
                  active ? 'text-[#B5924D]' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.label}
              </span>
              {/* Active dot indicator */}
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#B5924D]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
