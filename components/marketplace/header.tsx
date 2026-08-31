import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Search, ShoppingCart, Bell, ChevronDown, Menu, Store, LayoutGrid, FileText, Package, User, Award, Shield } from 'lucide-react'

function Logo() {
  return (
    <span className="flex shrink-0 items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-gradient-to-tr from-zinc-950 to-zinc-800 text-white shadow-md dark:from-zinc-100 dark:to-white dark:text-zinc-950 border border-zinc-200/10">
        <span className="h-2 w-2 rounded-full bg-[#B5924D] animate-pulse" />
      </span>
      <span className="text-[18px] font-black tracking-[-0.03em] text-zinc-950 dark:text-white">
        Thok<span className="text-[#B5924D] font-extrabold">Sale</span>
      </span>
    </span>
  )
}

export async function MarketplaceHeader({ q, showSearch = true }: { q?: string; showSearch?: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let role: string | null = null
  let cartItemCount = 0
  let unreadNotif = 0
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    role = data?.role || null
    if (role === 'buyer') {
      const { data: carts } = await supabase
        .from('carts').select('cart_items(id)').eq('buyer_id', user.id).eq('is_active', true).is('deleted_at', null)
      cartItemCount = (carts || []).reduce((n: number, c: any) => n + (c.cart_items?.length || 0), 0)
    }
    const { count } = await supabase.from('notifications').select('id', { head: true, count: 'exact' }).eq('user_id', user.id).eq('is_read', false)
    unreadNotif = count || 0
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/50 bg-white/90 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/90 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition-all">
      <div className="mx-auto flex max-w-7xl items-center gap-3 sm:gap-6 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        {/* Mobile menu trigger with premium circular target */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 hover:bg-zinc-100/80 active:scale-95 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/80 dark:text-zinc-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-xs rounded-r-[24px] border-r border-zinc-100 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-950">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-left"><Logo /></SheetTitle>
            </SheetHeader>
            <nav className="space-y-1.5" aria-label="Main navigation">
              <MobileNavLink href="/products" icon={<Store className="h-4.5 w-4.5" />}>Marketplace</MobileNavLink>
              <MobileNavLink href="/industries" icon={<LayoutGrid className="h-4.5 w-4.5" />}>Industries</MobileNavLink>
              {role === 'buyer' && <MobileNavLink href="/rfq" icon={<FileText className="h-4.5 w-4.5" />}>My RFQs</MobileNavLink>}
              {role === 'buyer' && <MobileNavLink href="/orders" icon={<Package className="h-4.5 w-4.5" />}>My Orders</MobileNavLink>}
              {role === 'seller' && <MobileNavLink href="/seller" icon={<LayoutGrid className="h-4.5 w-4.5" />}>Seller Dashboard</MobileNavLink>}
              {role === 'seller' && <MobileNavLink href="/seller/products" icon={<Package className="h-4.5 w-4.5" />}>My Products</MobileNavLink>}
              {role === 'seller' && <MobileNavLink href="/seller/orders" icon={<FileText className="h-4.5 w-4.5" />}>Seller Orders</MobileNavLink>}
              {user && <MobileNavLink href="/account" icon={<User className="h-4.5 w-4.5" />}>Account Details</MobileNavLink>}
              {!user && (
                <div className="pt-6 space-y-3">
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full rounded-full h-11 border-zinc-200 font-bold hover:bg-zinc-50">Sign in</Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button className="w-full rounded-full h-11 bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold shadow-md">Get started</Button>
                  </Link>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="shrink-0" aria-label="ThokSale — Home">
          <Logo />
        </Link>

        {/* Primary nav — desktop only, highly-polished spacing */}
        <nav className="hidden lg:flex items-center gap-1.5 ml-2" aria-label="Primary">
          <NavLink href="/products">Marketplace</NavLink>
          <NavLink href="/industries">Industries</NavLink>
          {role === 'buyer' && <NavLink href="/rfq">RFQs</NavLink>}
          {role === 'seller' && <NavLink href="/seller/products">Sell on ThokSale</NavLink>}
        </nav>

        {/* Compact search — reserved, not dominant, Apple styling */}
        {showSearch && (
          <form action="/products" method="GET" className="ml-auto hidden md:block max-w-sm lg:max-w-md flex-1" role="search">
            <label htmlFor="hdr-search" className="sr-only">Search products & suppliers</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
              <Input
                id="hdr-search"
                name="q"
                defaultValue={q}
                placeholder="Search products, verified factories..."
                enterKeyHint="search"
                className="h-10 pl-10 pr-3 rounded-full bg-zinc-50 border border-zinc-200/50 text-sm placeholder:text-zinc-400 hover:bg-zinc-100/50 hover:border-zinc-300 focus-visible:bg-white focus-visible:border-[#B5924D] focus-visible:ring-4 focus-visible:ring-[#B5924D]/10 transition-all duration-200"
              />
            </div>
          </form>
        )}

        <div className={`flex items-center gap-2 ${!showSearch ? 'ml-auto' : 'md:ml-0 ml-auto'}`}>
          {/* Mobile search icon button with touch target */}
          {showSearch && (
            <Link href="/products" className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 hover:bg-zinc-100/80 active:scale-95 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-200 transition-all" aria-label="Search">
              <Search className="h-4.5 w-4.5" />
            </Link>
          )}

          {!user ? (
            <>
              <Link href="/login" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" className="rounded-full h-10 px-4 font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full h-10 px-5 bg-[#B5924D] hover:bg-[#a38141] text-white font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">Get started</Button>
              </Link>
            </>
          ) : (
            <>
              {role === 'buyer' && (
                <Link href="/cart" aria-label={`Cart${cartItemCount > 0 ? ` (${cartItemCount} item${cartItemCount === 1 ? '' : 's'})` : ''}`}>
                  <button className="relative flex h-11 w-11 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 hover:bg-zinc-100/80 active:scale-95 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-200 transition-all">
                    <ShoppingCart className="h-4.5 w-4.5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B5924D] px-1.5 text-[10px] font-black text-white shadow-md leading-none">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                </Link>
              )}
              <Link href="/notifications" aria-label={`Notifications${unreadNotif > 0 ? ' (unread)' : ''}`}>
                <button className="relative flex h-11 w-11 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 hover:bg-zinc-100/80 active:scale-95 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-200 transition-all">
                  <Bell className="h-4.5 w-4.5" />
                  {unreadNotif > 0 && (
                    <span className="absolute right-0.5 top-0.5 inline-block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" aria-hidden />
                  )}
                </button>
              </Link>
              <Link href="/account" className="ml-1 hidden sm:inline-flex">
                <Button size="sm" variant="outline" className="rounded-full h-10 px-4 gap-1.5 border-zinc-200 hover:bg-zinc-50 font-bold">
                  Account <ChevronDown className="h-4 w-4 text-zinc-400" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-full px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-200">
      {children}
    </Link>
  )
}

function MobileNavLink({ href, icon, children }: { href: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white transition-all active:scale-[0.98] duration-200 touch-target"
    >
      {icon && <span className="text-zinc-400 dark:text-zinc-500">{icon}</span>}
      {children}
    </Link>
  )
}
