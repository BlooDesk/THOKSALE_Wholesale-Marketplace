import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StitchSellerNav } from '@/components/seller/stitch-seller-nav'
import { getStatusLabel, getStatusColor } from '@/services/order.service'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS = [
  { value: '',           label: 'All' },
  { value: 'pending',    label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped',    label: 'Dispatched' },
  { value: 'delivered',  label: 'Delivered' },
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

const PAGE_SIZE = 15

export default async function SellerOrdersPage({
  searchParams: rawParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const searchParams = await rawParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/seller/orders')

  const statusFilter = searchParams.status ?? ''
  const page = Math.max(1, Number(searchParams.page ?? 1))
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('orders')
    .select(`
      id, status, grand_total, subtotal, created_at,
      order_items ( product_name, quantity, unit ),
      company_profiles!orders_buyer_company_id_fkey ( display_name, legal_name )
    `, { count: 'exact' })
    .eq('seller_id', user.id)
    .is('deleted_at', null)
    .range(offset, offset + PAGE_SIZE - 1)
    .order('created_at', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)

  const { data: orders, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const showOrders = orders ?? []

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0A0D14] pb-32 font-sans">
      <StitchSellerNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#0F172A] dark:text-white tracking-tight">Incoming Orders</h1>
            <p className="text-xs text-slate-500 mt-0.5">{(count ?? 0).toLocaleString('en-IN')} orders total</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {STATUS_FILTERS.map((f) => {
            const params = new URLSearchParams()
            if (f.value) params.set('status', f.value)
            const active = statusFilter === f.value
            return (
              <Link
                key={f.value}
                href={`/seller/orders${params.toString() ? '?' + params.toString() : ''}`}
                className={`flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                  active
                    ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] border-transparent'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#B5924D]'
                }`}
              >
                {f.label}
              </Link>
            )
          })}
        </div>

        {/* Orders table (desktop) / cards (mobile) */}
        {showOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">inbox</span>
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No orders yet</h3>
            <p className="text-sm text-slate-400 mt-1">Your incoming orders will appear here</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    {['Order ID', 'Buyer', 'Items', 'Date', 'Total', 'Status', ''].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {showOrders.map((o: any) => {
                    const colorKey = getStatusColor(o.status)
                    const colorClass = STATUS_COLORS[colorKey]
                    const items = o.order_items ?? []
                    const buyer = o['company_profiles!orders_buyer_company_id_fkey']
                    const buyerName = buyer?.display_name ?? buyer?.legal_name ?? 'Direct Buyer'

                    return (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-mono font-bold text-[#0F172A] dark:text-white">
                            #{o.id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300 max-w-[160px] truncate">
                          {buyerName}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {items.length > 0
                            ? `${items[0].quantity} × ${items[0].product_name}${items.length > 1 ? ` +${items.length - 1}` : ''}`
                            : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400">
                          {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-black text-[#0F172A] dark:text-white tabular-nums">
                          {formatCurrency(o.grand_total ?? o.subtotal ?? 0)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
                            {getStatusLabel(o.status)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/seller/orders/${o.id}`}
                            className="text-[11px] font-bold text-[#B5924D] hover:underline"
                          >
                            Manage →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {showOrders.map((o: any) => {
                const colorKey = getStatusColor(o.status)
                const colorClass = STATUS_COLORS[colorKey]
                const items = o.order_items ?? []
                const buyer = o['company_profiles!orders_buyer_company_id_fkey']
                const buyerName = buyer?.display_name ?? buyer?.legal_name ?? 'Direct Buyer'

                return (
                  <Link
                    key={o.id}
                    href={`/seller/orders/${o.id}`}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 flex items-start gap-3 hover:border-[#B5924D]/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-slate-500">#{o.id.slice(-8).toUpperCase()}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
                          {getStatusLabel(o.status)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#0F172A] dark:text-white truncate">{buyerName}</p>
                      {items[0] && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {items[0].quantity} × {items[0].product_name}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black text-[#0F172A] dark:text-white">{formatCurrency(o.grand_total ?? o.subtotal ?? 0)}</div>
                      <span className="material-symbols-outlined text-[18px] text-slate-300 mt-1">chevron_right</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 pt-2">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams()
              if (statusFilter) params.set('status', statusFilter)
              params.set('page', String(p))
              return (
                <Link
                  key={p}
                  href={`/seller/orders?${params.toString()}`}
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
    </div>
  )
}
