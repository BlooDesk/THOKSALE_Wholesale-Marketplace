'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { toast } from 'sonner'

export function StitchHeader() {
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [city, setCity] = useState('Mumbai, IN')
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSignOut = async () => {
    setShowUserMenu(false)
    await signOut()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#F9F8F4]/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-[#CBD5E1]/40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Location Selector (Compact) */}
            <div
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors flex-shrink-0"
              title="Change Delivery Location"
            >
              <span
                className="material-symbols-outlined text-[#775a1a] dark:text-[#B5924D] text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-[#64748B] font-semibold leading-none uppercase tracking-wider">
                  Deliver to
                </span>
                <span className="text-[12px] font-bold text-[#0F172A] dark:text-slate-100 truncate max-w-[90px] sm:max-w-[120px]">
                  {city}
                </span>
              </div>
            </div>

            {/* Center Logo */}
            <Link href="/" className="flex items-center justify-center flex-shrink-0 group">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-black text-base tracking-tighter border border-[#B5924D]/40 shadow-xs group-hover:scale-105 transition-transform">
                  T
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-extrabold tracking-tight text-[#0F172A] dark:text-white leading-none">
                    THOK<span className="text-[#B5924D]">SALE</span>
                  </span>
                  <span className="text-[9px] tracking-widest uppercase font-semibold text-[#64748B] leading-none mt-0.5">
                    Wholesale
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Search Bar (Hidden on Mobile) */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="w-full">
                <div className="flex items-center w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 shadow-xs focus-within:border-[#B5924D] focus-within:ring-2 focus-within:ring-[#B5924D]/20 transition-all">
                  <span className="material-symbols-outlined text-slate-400 text-[20px] mr-2">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, wholesale slabs or suppliers..."
                    className="w-full bg-transparent border-none p-0 text-sm text-[#0F172A] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                  />
                  <button type="submit" className="text-xs font-bold text-[#B5924D] hover:text-[#775a1a] px-2 py-0.5">
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* RFQ shortcut button (desktop) */}
              <Link
                href="/rfq/new"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#B5924D]/10 text-[#775a1a] dark:text-[#B5924D] border border-[#B5924D]/30 hover:bg-[#B5924D]/20 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Post RFQ</span>
              </Link>

              {/* Notifications */}
              <Link
                href="/notifications"
                className="text-[#0F172A] dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 p-2 rounded-full transition-all relative"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-[#F9F8F4]"></span>
              </Link>

              {/* User / Profile Menu */}
              <div className="relative">
                {loading ? (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                ) : user ? (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 p-1 pr-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-black ring-1 ring-[#B5924D]/60">
                      {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold text-[#0F172A] dark:text-white max-w-[80px] truncate">
                      {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#0F172A] text-white hover:bg-[#B5924D] transition-all shadow-xs flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">login</span>
                    <span>Login</span>
                  </Link>
                )}

                {/* Dropdown Menu */}
                {showUserMenu && user && (
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-black text-[#0F172A] dark:text-white truncate">
                        {profile?.full_name || 'My Account'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      {profile?.company_name && (
                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                          🏢 {profile.company_name}
                        </p>
                      )}
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-black rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                        {profile?.role === 'seller' ? 'Seller Account' : 'Wholesale Buyer'}
                      </span>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                      <span>Account Profile & Hub</span>
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400">inventory_2</span>
                      <span>My Orders & Tracking</span>
                    </Link>

                    <Link
                      href="/rfq"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400">request_quote</span>
                      <span>My RFQ Workspace</span>
                    </Link>

                    <Link
                      href="/account/wallet"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400">account_balance_wallet</span>
                      <span>Trade Credit Wallet</span>
                    </Link>

                    <Link
                      href="/seller"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#B5924D] font-bold hover:bg-[#B5924D]/10 transition-colors border-t border-slate-100 dark:border-slate-800"
                    >
                      <span className="material-symbols-outlined text-[18px]">storefront</span>
                      <span>Factory / Seller Console</span>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border-t border-slate-100 dark:border-slate-800"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#B5924D] text-[20px]">location_on</span>
                Select Logistics Hub
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Pricing slabs and rail freight timelines are optimized for your dispatch corridor.
            </p>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {[
                'Mumbai, IN (JNPT Port Corridor)',
                'Pune, IN (Chakan Industrial Area)',
                'Delhi NCR (Faridabad / Gurugram)',
                'Surat, IN (Textile & Diamond Hub)',
                'Bengaluru, IN (Electronic City Hub)',
                'Ahmedabad, IN (Sanand Corridor)',
                'Chennai, IN (Sriperumbudur Hub)',
                'Kolkata, IN (Howrah Freight Terminal)',
              ].map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setCity(loc.split('(')[0].trim())
                    setShowLocationModal(false)
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    city === loc.split('(')[0].trim()
                      ? 'bg-[#B5924D]/15 text-[#775a1a] dark:text-[#B5924D] font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{loc}</span>
                  {city === loc.split('(')[0].trim() && (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
