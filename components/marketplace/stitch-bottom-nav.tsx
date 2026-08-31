'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'

export function StitchBottomNav() {
  const pathname = usePathname()
  const { user, profile } = useAuth()

  const isHome = pathname === '/'
  const isProducts = pathname.startsWith('/products') || pathname.startsWith('/categories')
  const isRfq = pathname.startsWith('/rfq')
  const isCart = pathname.startsWith('/cart') || pathname.startsWith('/checkout')
  const isAccount = pathname.startsWith('/account') || pathname.startsWith('/seller')

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-4 py-2 border-t border-[#c6c6cd]/20 bg-[#ffffff] dark:bg-[#0F172A] shadow-lg rounded-t-2xl pb-safe md:max-w-md md:left-1/2 md:-translate-x-1/2 md:bottom-3 md:rounded-2xl md:border">
      {/* Home */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all duration-150 ${
          isHome
            ? 'text-[#775a1a] dark:text-[#e8c177] bg-[#fdd488]/30 font-semibold'
            : 'text-[#45464d] dark:text-[#c6c6cd] hover:text-[#775a1a]'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px] leading-none mb-0.5"
          style={isHome ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          home
        </span>
        <span className="text-[11px] font-medium leading-tight">Home</span>
      </Link>

      {/* Categories / Products */}
      <Link
        href="/products"
        className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all duration-150 ${
          isProducts
            ? 'text-[#775a1a] dark:text-[#e8c177] bg-[#fdd488]/30 font-semibold'
            : 'text-[#45464d] dark:text-[#c6c6cd] hover:text-[#775a1a]'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px] leading-none mb-0.5"
          style={isProducts ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          grid_view
        </span>
        <span className="text-[11px] font-medium leading-tight">Catalog</span>
      </Link>

      {/* Floating Center RFQ CTA */}
      <Link
        href="/rfq"
        className="flex flex-col items-center justify-center text-white bg-[#0F172A] dark:bg-[#B5924D] hover:bg-[#B5924D] rounded-full w-14 h-14 -mt-7 shadow-lg shadow-black/20 transition-transform active:scale-95 border-2 border-white dark:border-slate-900"
      >
        <span
          className="material-symbols-outlined text-[22px] leading-none mb-0.5"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          request_quote
        </span>
        <span className="text-[9px] font-bold uppercase tracking-tighter">RFQ</span>
      </Link>

      {/* Cart */}
      <Link
        href="/cart"
        className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all duration-150 relative ${
          isCart
            ? 'text-[#775a1a] dark:text-[#e8c177] bg-[#fdd488]/30 font-semibold'
            : 'text-[#45464d] dark:text-[#c6c6cd] hover:text-[#775a1a]'
        }`}
      >
        <div className="relative">
          <span
            className="material-symbols-outlined text-[22px] leading-none mb-0.5"
            style={isCart ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            shopping_cart
          </span>
          <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-[#B5924D] rounded-full"></span>
        </div>
        <span className="text-[11px] font-medium leading-tight">Cart</span>
      </Link>

      {/* Account / Seller Hub */}
      <Link
        href={profile?.role === 'seller' ? '/seller' : user ? '/account' : '/login'}
        className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all duration-150 ${
          isAccount
            ? 'text-[#775a1a] dark:text-[#e8c177] bg-[#fdd488]/30 font-semibold'
            : 'text-[#45464d] dark:text-[#c6c6cd] hover:text-[#775a1a]'
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px] leading-none mb-0.5"
          style={isAccount ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {profile?.role === 'seller' ? 'storefront' : 'person'}
        </span>
        <span className="text-[11px] font-medium leading-tight">
          {profile?.role === 'seller' ? 'Seller' : 'Account'}
        </span>
      </Link>
    </nav>
  )
}
