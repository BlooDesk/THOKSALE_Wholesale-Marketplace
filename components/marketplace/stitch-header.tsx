'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ThokSaleLogo } from '@/components/marketplace/thoksale-logo'

export function StitchHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, loading, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [city, setCity] = useState('Mumbai')
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  // Close user menu on route change
  useEffect(() => {
    setShowUserMenu(false)
    setShowMobileSearch(false)
  }, [pathname])

  // Close menu on outside click
  useEffect(() => {
    if (!showUserMenu) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-user-menu]')) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showUserMenu])

  // Fetch cart + notif counts
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    let cancelled = false

    const fetchCounts = async () => {
      const [cartRes, notifRes] = await Promise.allSettled([
        supabase
          .from('carts')
          .select('id, cart_items(id)')
          .eq('buyer_id', user.id)
          .eq('is_active', true)
          .is('deleted_at', null)
          .maybeSingle(),
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false),
      ])
      if (cancelled) return
      if (cartRes.status === 'fulfilled' && cartRes.value.data) {
        setCartCount((cartRes.value.data as any).cart_items?.length ?? 0)
      }
      if (notifRes.status === 'fulfilled') {
        setUnreadCount(notifRes.value.count ?? 0)
      }
    }
    fetchCounts()
    return () => { cancelled = true }
  }, [user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowMobileSearch(false)
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

  const avatarUrl = profile?.avatar_url || (user?.user_metadata as any)?.avatar_url || null
  const initials = (profile?.full_name || (user?.user_metadata as any)?.full_name || user?.email || 'U').charAt(0).toUpperCase()
  const displayName = profile?.full_name || (user?.user_metadata as any)?.full_name || user?.email?.split('@')[0] || 'My Account'

  return (
    <>
      {/* ── Main Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-2">

            {/* ── Logo ──── */}
            <Link href="/" className="flex-shrink-0 group mr-1" aria-label="ThokSale — Home">
              <ThokSaleLogo size="sm" className="group-hover:opacity-90 transition-opacity" />
            </Link>

            {/* ── Location pill (desktop only) ──── */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="hidden sm:flex items-center gap-1 flex-shrink-0 border border-slate-200 dark:border-slate-700 hover:border-[#B5924D] rounded-full px-2.5 py-1 transition-colors"
              title="Change delivery location"
            >
              <span className="material-symbols-outlined text-[#B5924D] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                location_on
              </span>
              <span className="text-[11px] font-bold text-[#0F172A] dark:text-slate-100 max-w-[80px] truncate">
                {city}
              </span>
              <span className="material-symbols-outlined text-slate-400 text-[12px]">expand_more</span>
            </button>

            {/* ── Desktop Search ──── */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-2">
              <div className="flex items-center w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 focus-within:border-[#B5924D] focus-within:ring-2 focus-within:ring-[#B5924D]/20 transition-all">
                <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2 flex-shrink-0">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, suppliers, categories..."
                  className="flex-1 min-w-0 bg-transparent text-sm text-[#0F172A] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 text-xs font-bold text-[#B5924D] hover:text-[#775a1a] ml-2 px-2 py-0.5 rounded-full hover:bg-[#B5924D]/10 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* ── Spacer ──── */}
            <div className="flex-1 md:hidden" />

            {/* ── Right Action Icons ──── */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">



              {/* Cart — only when logged in */}
              {user && (
                <Link
                  href="/cart"
                  className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label={`Cart ${cartCount > 0 ? `(${cartCount} items)` : ''}`}
                >
                  <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] bg-[#B5924D] text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 ring-2 ring-white dark:ring-[#0F172A]">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 ? (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 ring-2 ring-white dark:ring-[#0F172A]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white dark:ring-[#0F172A]" />
                )}
              </Link>

              {/* User Avatar / Account / Settings Trigger */}
              <div className="relative" data-user-menu>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-1.5 focus:outline-none select-none"
                  aria-label="Account, Profile and Settings"
                  aria-expanded={showUserMenu}
                >
                  {user ? (
                    avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-[#B5924D]/60 hover:ring-[#B5924D] transition-all shadow-xs"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#0F172A] dark:bg-[#B5924D]/20 text-white dark:text-[#B5924D] flex items-center justify-center text-xs font-black ring-2 ring-[#B5924D]/60 hover:ring-[#B5924D] transition-all shadow-xs">
                        {initials}
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-1 h-8 px-2 sm:px-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#B5924D]/10 hover:text-[#B5924D] dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all text-xs font-bold shadow-xs">
                      <span className="material-symbols-outlined text-[18px]">account_circle</span>
                      <span className="hidden sm:inline">Sign In</span>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu (Positioned safely for mobile & desktop) */}
                {showUserMenu && (
                  <div className="fixed top-14 right-2 left-2 sm:left-auto sm:right-0 sm:absolute sm:top-full mt-2 sm:w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {user ? (
                      <>
                        {/* User Header */}
                        <div className="px-4 py-3.5 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white">
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-11 h-11 rounded-xl object-cover ring-2 ring-[#B5924D]/40 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-[#B5924D]/20 border border-[#B5924D]/30 flex items-center justify-center text-[#B5924D] font-black text-lg flex-shrink-0">
                                {initials}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black text-white truncate">{displayName}</p>
                              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-[#B5924D]/20 text-[#B5924D] uppercase tracking-wider">
                                  {profile?.role === 'seller' ? 'Seller' : 'Buyer'}
                                </span>
                                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-400">
                                  Verified
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="py-1 divide-y divide-slate-100 dark:divide-slate-800">
                          <div className="py-1">
                            {[
                              { href: '/account', icon: 'person', label: 'My Account' },
                              { href: '/account/business', icon: 'settings', label: 'Business Profile & Settings' },
                              { href: '/orders', icon: 'inventory_2', label: 'My Orders' },
                              { href: '/rfq', icon: 'request_quote', label: 'RFQ Inquiries' },
                              { href: '/account/invoices', icon: 'receipt_long', label: 'GST Invoices' },
                              { href: '/account/wallet', icon: 'account_balance_wallet', label: 'Trade Credit Wallet' },
                            ].map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px] text-slate-400">{item.icon}</span>
                                <span>{item.label}</span>
                              </Link>
                            ))}
                          </div>

                          <div className="py-1">
                            <Link
                              href="/seller"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-xs sm:text-sm font-bold text-[#B5924D] hover:bg-[#B5924D]/10 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">storefront</span>
                              <span>Supplier Console</span>
                            </Link>
                          </div>

                          <div className="py-1">
                            <button
                              type="button"
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-3 px-4 py-2 text-xs sm:text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">logout</span>
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Guest Header & Action Links */
                      <div className="p-4 space-y-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-black text-base border border-[#B5924D]/40">
                            T
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#0F172A] dark:text-white">Welcome to THOKSALE</p>
                            <p className="text-[10px] text-slate-500">India's B2B Wholesale Marketplace</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-1">
                          <Link
                            href="/login"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full bg-[#0F172A] hover:bg-[#1e293b] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">login</span>
                            <span>Sign In</span>
                          </Link>
                          <Link
                            href="/register"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full bg-[#B5924D] hover:bg-[#a07d3e] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            <span>Register Wholesale Business</span>
                          </Link>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                          {[
                            { href: '/orders', icon: 'local_shipping', label: 'Track Your Orders' },
                            { href: '/rfq/new', icon: 'request_quote', label: 'Post Bulk RFQ' },
                            { href: '/distribution', icon: 'hub', label: 'Explore Dealerships' },
                            { href: '/seller', icon: 'storefront', label: 'Sell on THOKSALE' },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2.5 px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#B5924D] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px] text-slate-400">{item.icon}</span>
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar — always visible below header, Blinkit-style */}
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 px-3 py-2 bg-white dark:bg-[#0F172A]">
          <form onSubmit={handleSearch}>
            <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-2 focus-within:border-[#B5924D] focus-within:ring-2 focus-within:ring-[#B5924D]/20 transition-all">
              <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2 flex-shrink-0">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or suppliers..."
                className="flex-1 min-w-0 bg-transparent text-sm text-[#0F172A] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              <span className="material-symbols-outlined text-slate-400 text-[20px] ml-2 flex-shrink-0">mic</span>
            </div>
          </form>
        </div>
      </header>

      {/* Location Modal */}
      {showLocationModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setShowLocationModal(false)}
        >
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#B5924D] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  location_on
                </span>
                Select Delivery Hub
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-slate-500">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">Pricing slabs and freight timelines are optimized for your corridor.</p>

            <div className="space-y-1 max-h-60 overflow-y-auto -mx-1 px-1">
              {[
                { short: 'Mumbai', full: 'Mumbai (JNPT Port Corridor)' },
                { short: 'Pune', full: 'Pune (Chakan Industrial Area)' },
                { short: 'Delhi NCR', full: 'Delhi NCR (Faridabad / Gurugram)' },
                { short: 'Surat', full: 'Surat (Textile & Diamond Hub)' },
                { short: 'Bengaluru', full: 'Bengaluru (Electronic City Hub)' },
                { short: 'Ahmedabad', full: 'Ahmedabad (Sanand Corridor)' },
                { short: 'Chennai', full: 'Chennai (Sriperumbudur Hub)' },
                { short: 'Kolkata', full: 'Kolkata (Howrah Freight Terminal)' },
              ].map((loc) => {
                const active = city === loc.short
                return (
                  <button
                    key={loc.short}
                    onClick={() => { setCity(loc.short); setShowLocationModal(false) }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between ${
                      active
                        ? 'bg-[#B5924D]/10 text-[#B5924D] font-bold border border-[#B5924D]/30'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <span>{loc.full}</span>
                    {active && <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
