'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'

export function StitchSellerNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile } = useAuth()

  const isDashboard = pathname === '/seller'
  const isOrders = pathname.startsWith('/seller/orders')
  const isProducts = pathname.startsWith('/seller/products') || pathname.startsWith('/seller/inventory')
  const isRfq = pathname.startsWith('/seller/rfq')
  const isProfile = pathname.startsWith('/seller/company-profile') || pathname.startsWith('/seller/store')

  return (
    <>
      {/* Seller Top Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5" title="Back to Marketplace">
              <span className="material-symbols-outlined text-slate-500 hover:text-slate-900 dark:hover:text-white">
                arrow_back
              </span>
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white leading-none">
                  {profile?.company_name || 'Seller Dashboard'}
                </h1>
                <span
                  className="material-symbols-outlined text-emerald-600 text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  title="Verified Manufacturer"
                >
                  check_circle
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Supplier Console</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-1 bg-[#B5924D] hover:bg-[#96773a] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">add_box</span>
              <span className="hidden sm:inline">Add Product</span>
            </Link>

            <Link
              href="/"
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#0F172A] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              Buyer Mode
            </Link>
          </div>
        </div>
      </header>

      {/* Seller Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-[#FFFFFF] dark:bg-[#0F172A] shadow-md rounded-t-xl pb-safe md:max-w-md md:left-1/2 md:-translate-x-1/2 md:bottom-3 md:rounded-2xl md:border">
        <Link
          href="/seller"
          className={`flex flex-col items-center justify-center px-3 py-1 transition-colors ${
            isDashboard ? 'text-[#B5924D] font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span
            className="material-symbols-outlined mb-0.5 text-[22px]"
            style={isDashboard ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            dashboard
          </span>
          <span className="text-[11px] font-semibold">Home</span>
        </Link>

        <Link
          href="/seller/orders"
          className={`flex flex-col items-center justify-center px-3 py-1 transition-colors ${
            isOrders ? 'text-[#B5924D] font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span
            className="material-symbols-outlined mb-0.5 text-[22px]"
            style={isOrders ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            list_alt
          </span>
          <span className="text-[11px] font-semibold">Orders</span>
        </Link>

        <Link
          href="/seller/products"
          className={`flex flex-col items-center justify-center px-3 py-1 transition-colors ${
            isProducts ? 'text-[#B5924D] font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span
            className="material-symbols-outlined mb-0.5 text-[22px]"
            style={isProducts ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            inventory_2
          </span>
          <span className="text-[11px] font-semibold">Products</span>
        </Link>

        <Link
          href="/seller/rfq"
          className={`flex flex-col items-center justify-center px-3 py-1 transition-colors ${
            isRfq ? 'text-[#B5924D] font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span
            className="material-symbols-outlined mb-0.5 text-[22px]"
            style={isRfq ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            request_quote
          </span>
          <span className="text-[11px] font-semibold">RFQs</span>
        </Link>

        <Link
          href="/seller/company-profile"
          className={`flex flex-col items-center justify-center px-3 py-1 transition-colors ${
            isProfile ? 'text-[#B5924D] font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span
            className="material-symbols-outlined mb-0.5 text-[22px]"
            style={isProfile ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            storefront
          </span>
          <span className="text-[11px] font-semibold">Store</span>
        </Link>
      </nav>
    </>
  )
}
