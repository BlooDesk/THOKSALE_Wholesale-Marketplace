import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StitchSellerNav } from '@/components/seller/stitch-seller-nav'
import { getSellerOrderStats } from '@/services/order.service'
import { getStatusLabel, getStatusColor } from '@/services/order.service'

export const dynamic = 'force-dynamic'

function formatCurrency(n: number) {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toLocaleString('en-IN')}`
}

const STATUS_COLORS: Record<string, string> = {
  green:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
  yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-500',
  red:    'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
  gray:   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

export default async function SellerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ── Profile ───────────────────────────────────────────────────────────────
  let sellerProfile: any = null
  if (user) {
    const { data: cp } = await supabase
      .from('company_profiles')
      .select('id, display_name, legal_name, city, state, kyc_status, logo_url, description')
      .eq('profile_id', user.id)
      .maybeSingle()
    sellerProfile = cp
  }

  const sellerName = sellerProfile?.display_name ?? sellerProfile?.legal_name ?? 'Your Business'
  const location = [sellerProfile?.city, sellerProfile?.state].filter(Boolean).join(', ') || 'India'

  // ── Stats ────────────────────────────────────────────────────────────────
  let stats = { pending: 0, processing: 0, completed: 0, totalRevenue: 0 }
  let recentOrders: any[] = []
  let lowStockProducts: any[] = []
  let productCount = 0

  if (user) {
    const [statsRes, ordersRes, inventoryRes, productsRes] = await Promise.allSettled([
      getSellerOrderStats(user.id),
      supabase
        .from('orders')
        .select(`
          id, status, grand_total, subtotal, created_at,
          order_items ( product_name, quantity )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('products')
        .select('id, name, stock_quantity, status')
        .eq('seller_id', user.id)
        .eq('status', 'active')
        .lt('stock_quantity', 10)
        .limit(5),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'active'),
    ])

    if (statsRes.status === 'fulfilled') stats = statsRes.value
    if (ordersRes.status === 'fulfilled') recentOrders = ordersRes.value.data ?? []
    if (inventoryRes.status === 'fulfilled') lowStockProducts = inventoryRes.value.data ?? []
    if (productsRes.status === 'fulfilled') productCount = productsRes.value.count ?? 0
  }

  const STAT_CARDS = [
    { label: 'Total Revenue',      value: formatCurrency(stats.totalRevenue),   icon: 'currency_rupee',  color: 'text-emerald-600' },
    { label: 'Pending Orders',     value: String(stats.pending),                icon: 'pending_actions', color: 'text-amber-600' },
    { label: 'In Progress',        value: String(stats.processing),             icon: 'local_shipping',  color: 'text-blue-600' },
    { label: 'Completed Orders',   value: String(stats.completed),             icon: 'task_alt',         color: 'text-emerald-600' },
    { label: 'Active Products',    value: String(productCount),                 icon: 'inventory_2',     color: 'text-indigo-600' },
  ]

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0A0D14] text-[#0F172A] dark:text-slate-100 pb-24 md:pb-8 font-sans">
      <StitchSellerNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">

        {/* ── Profile Greeting ───────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#B5924D]/20 border border-[#B5924D]/30 flex items-center justify-center font-black text-2xl text-[#B5924D]">
              {sellerName.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Seller Dashboard</div>
              <h1 className="text-xl font-extrabold text-white mt-0.5 leading-tight">{sellerName}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
                <span className="text-xs text-slate-400">{location}</span>
                {sellerProfile?.kyc_status === 'verified' && (
                  <span className="ml-1 inline-flex items-center gap-0.5 bg-emerald-600/20 text-emerald-400 border border-emerald-600/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    KYC Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link href="/seller/products/new" className="bg-[#B5924D] hover:bg-[#a07d3e] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95">
              <span className="material-symbols-outlined text-[17px]">add</span>
              Add Product
            </Link>
            <Link href="/seller/orders" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-4 py-2.5 rounded-xl transition-all">
              All Orders
            </Link>
          </div>
        </div>

        {/* ── Stats Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2">
              <span className={`material-symbols-outlined text-[22px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {s.icon}
              </span>
              <div>
                <div className="text-xl font-black text-[#0F172A] dark:text-white tabular-nums">{s.value}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/seller/products/new',       icon: 'add_circle',      label: 'Add Product' },
            { href: '/seller/orders?status=pending', icon: 'pending_actions', label: 'Pending Orders' },
            { href: '/seller/inventory',           icon: 'inventory_2',     label: 'Inventory' },
            { href: '/seller/partner-codes',       icon: 'discount',        label: 'Partner Codes' },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-2.5 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#B5924D]/50 hover:shadow-md transition-all group"
            >
              <span className="material-symbols-outlined text-[20px] text-[#B5924D] group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
                {a.icon}
              </span>
              <span className="text-sm font-bold text-[#0F172A] dark:text-white">{a.label}</span>
            </Link>
          ))}
        </div>

        {/* ── Recent Orders ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-black text-[#0F172A] dark:text-white">Recent Orders</h2>
            <Link href="/seller/orders" className="text-xs font-bold text-[#B5924D] hover:underline">View All →</Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-3">inbox</span>
              <p className="text-sm font-bold text-slate-500">No orders yet</p>
              <p className="text-xs text-slate-400 mt-1">Your orders will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {recentOrders.map((order: any) => {
                const colorKey = getStatusColor(order.status)
                const colorClass = STATUS_COLORS[colorKey]
                const items = order.order_items ?? []
                const firstItem = items[0]
                return (
                  <Link
                    key={order.id}
                    href={`/seller/orders/${order.id}`}
                    className="flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px] text-slate-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                        inventory_2
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#0F172A] dark:text-white font-mono">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {firstItem ? `${firstItem.quantity} × ${firstItem.product_name}` : `${items.length} item(s)`}
                        {items.length > 1 && ` +${items.length - 1} more`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black text-[#0F172A] dark:text-white">
                        {formatCurrency(order.grand_total ?? order.subtotal ?? 0)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Low Stock Alert ───────────────────────────────────────────── */}
        {lowStockProducts.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-amber-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">Low Stock Alert ({lowStockProducts.length} products)</h3>
            </div>
            <div className="space-y-2">
              {lowStockProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-xs text-amber-700 dark:text-amber-400 truncate max-w-[70%]">{p.name}</span>
                  <span className="text-xs font-bold text-red-600">{p.stock_quantity} left</span>
                </div>
              ))}
            </div>
            <Link href="/seller/inventory" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline">
              Update Inventory
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}
