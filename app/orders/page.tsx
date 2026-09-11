import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { getStatusLabel, getStatusColor } from '@/services/order.service'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS = [
  { value: '',          label: 'All Orders' },
  { value: 'pending',   label: 'Pending' },
  { value: 'processing',label: 'Processing' },
  { value: 'shipped',   label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_COLORS: Record<string, string> = {
  green:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
  yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-500',
  red:    'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
  gray:   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

function formatCurrency(n: number) {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toLocaleString('en-IN')}`
}

const PAGE_SIZE = 10

export default async function OrdersPage({
  searchParams: rawParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const searchParams = await rawParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/orders')

  const statusFilter = searchParams.status ?? ''
  const page = Math.max(1, Number(searchParams.page ?? 1))
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('orders')
    .select(`
      id, status, grand_total, subtotal, created_at,
      order_items ( product_name, quantity, unit, unit_price,
        products ( product_media ( public_url_or_reference, is_primary ) )
      ),
      company_profiles!orders_seller_company_id_fkey ( display_name, legal_name )
    `, { count: 'exact' })
    .eq('buyer_id', user.id)
    .is('deleted_at', null)
    .range(offset, offset + PAGE_SIZE - 1)
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data: orders, count, error } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // Determine if we should show demo data (empty DB)
  const showOrders: any[] = !error && orders && orders.length > 0 ? orders : []
  const isEmpty = showOrders.length === 0

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0A0D14] pb-24 md:pb-8 font-sans">
      <StitchHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 flex flex-col gap-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-[#0F172A] dark:text-white tracking-tight">My Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {count ? `${count.toLocaleString('en-IN')} orders found` : 'Track your wholesale orders'}
          </p>
        </div>

        {/* Status Filter tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {STATUS_FILTERS.map((f) => {
            const params = new URLSearchParams()
            if (f.value) params.set('status', f.value)
            const active = statusFilter === f.value
            return (
              <Link
                key={f.value}
                href={`/orders${params.toString() ? '?' + params.toString() : ''}`}
                className={`flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                  active
                    ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] border-transparent'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#B5924D] hover:text-[#B5924D]'
                }`}
              >
                {f.label}
              </Link>
            )
          })}
        </div>

        {/* Order list */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">receipt_long</span>
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No orders yet</h3>
            <p className="text-sm text-slate-400 mt-1 mb-5">Your wholesale orders will appear here</p>
            <Link href="/products" className="bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#B5924D] dark:hover:bg-[#B5924D] dark:hover:text-white transition-colors">
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {showOrders.map((order: any) => {
              const colorKey = getStatusColor(order.status)
              const colorClass = STATUS_COLORS[colorKey]
              const items = order.order_items ?? []
              const firstItem = items[0]
              const media = firstItem?.products?.product_media ?? []
              const imgUrl = media.find((m: any) => m.is_primary)?.public_url_or_reference ?? media[0]?.public_url_or_reference
              const sellerName = order['company_profiles!orders_seller_company_id_fkey']?.display_name
                ?? order['company_profiles!orders_seller_company_id_fkey']?.legal_name
                ?? 'Verified Supplier'

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#B5924D]/40 transition-all overflow-hidden"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Item preview */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Image */}
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={firstItem?.product_name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[22px] text-slate-400">inventory_2</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0F172A] dark:text-white line-clamp-1">
                        {firstItem?.product_name ?? 'Wholesale Order'}
                      </p>
                      {items.length > 1 && (
                        <p className="text-[11px] text-slate-400 mt-0.5">+{items.length - 1} more item{items.length > 2 ? 's' : ''}</p>
                      )}
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[12px]">storefront</span>
                        {sellerName}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black text-[#0F172A] dark:text-white">
                        {formatCurrency(order.grand_total ?? order.subtotal ?? 0)}
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-slate-300 dark:text-slate-700 group-hover:text-[#B5924D] transition-colors mt-1">
                        chevron_right
                      </span>
                    </div>
                  </div>

                  {/* Quick action bar for actionable statuses */}
                  {['pending', 'shipped'].includes(order.status) && (
                    <div className={`px-4 py-2 border-t border-slate-50 dark:border-slate-800 flex items-center gap-2 text-[11px] font-bold ${
                      order.status === 'pending' ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {order.status === 'pending' ? 'pending_actions' : 'local_shipping'}
                      </span>
                      {order.status === 'pending' ? 'Awaiting seller confirmation' : 'Your order is on the way'}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 pt-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams()
              if (statusFilter) params.set('status', statusFilter)
              params.set('page', String(p))
              return (
                <Link
                  key={p}
                  href={`/orders?${params.toString()}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                    p === page
                      ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#B5924D]'
                  }`}
                >
                  {p}
                </Link>
              )
            })}
          </div>
        )}

      </main>

      <StitchBottomNav />
    </div>
  )
}
