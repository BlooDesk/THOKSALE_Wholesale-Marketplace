import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { getStatusLabel, getStatusColor, ORDER_TIMELINE_STEPS } from '@/services/order.service'

function formatCurrency(n: number) {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

const STATUS_COLORS: Record<string, string> = {
  green:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
  yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-500',
  red:    'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
  gray:   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

// Resolve numeric step index from status string
function getStepIndex(status: string): number {
  const idx = ORDER_TIMELINE_STEPS.findIndex((s) => s.key === status)
  return idx >= 0 ? idx : 0
}

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id, product_name, product_sku, quantity, unit, unit_price, subtotal,
        products ( slug, product_media ( public_url_or_reference, is_primary ) )
      ),
      freight_quotes ( status, quoted_amount, carrier, transit_days, pickup_date, delivery_date ),
      company_profiles!orders_buyer_company_id_fkey ( display_name, legal_name ),
      company_profiles!orders_seller_company_id_fkey ( display_name, legal_name, city, state )
    `)
    .eq('id', id)
    .maybeSingle()

  if (error || !order) notFound()

  const colorKey = getStatusColor(order.status)
  const colorClass = STATUS_COLORS[colorKey]
  const currentStep = getStepIndex(order.status)
  const freight = order.freight_quotes?.[0]

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0A0D14] pb-24 md:pb-8 font-sans">
      <StitchHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 pb-12 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/orders" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#B5924D] transition-colors">
            <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-300">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-lg font-black text-[#0F172A] dark:text-white">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs text-slate-500">
              Placed {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${colorClass}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        {/* ── Timeline ─────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6">
          <h2 className="text-sm font-black text-[#0F172A] dark:text-white mb-5">Order Progress</h2>

          <div className="relative">
            {/* Vertical track */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />

            {ORDER_TIMELINE_STEPS.map((step, idx) => {
              const isDone = idx < currentStep
              const isCurrent = idx === currentStep
              const isFuture = idx > currentStep

              return (
                <div key={step.key} className="relative flex items-start gap-4 pb-6 last:pb-0">
                  {/* Circle */}
                  <div className={`relative z-10 w-8 h-8 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                    isDone ? 'bg-emerald-500 border-emerald-500' :
                    isCurrent ? 'bg-[#B5924D] border-[#B5924D]' :
                    'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}>
                    {isDone ? (
                      <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 pt-0.5 min-w-0">
                    <p className={`text-sm font-bold leading-tight ${
                      isFuture ? 'text-slate-400 dark:text-slate-600' :
                      isCurrent ? 'text-[#B5924D]' :
                      'text-[#0F172A] dark:text-white'
                    }`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-[11px] text-[#B5924D]/80 mt-0.5">Current status</p>
                    )}
                  </div>

                  {/* Timestamp (when done) */}
                  {isDone && (
                    <div className="text-[10px] text-slate-400 flex-shrink-0 pt-0.5">
                      Completed
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Order Items ──────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-black text-[#0F172A] dark:text-white">
              Items ({order.order_items?.length ?? 0})
            </h2>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {(order.order_items ?? []).map((item: any) => {
              const media = item.products?.product_media ?? []
              const imgUrl = media.find((m: any) => m.is_primary)?.public_url_or_reference ?? media[0]?.public_url_or_reference
              return (
                <div key={item.id} className="flex items-center gap-4 px-5 sm:px-6 py-4">
                  {imgUrl ? (
                    <img src={imgUrl} alt={item.product_name} className="w-14 h-14 rounded-xl object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[24px] text-slate-400">inventory_2</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0F172A] dark:text-white line-clamp-2">{item.product_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.quantity.toLocaleString('en-IN')} {item.unit ?? 'pcs'} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <div className="text-sm font-black text-[#0F172A] dark:text-white flex-shrink-0">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Price Breakdown ──────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6">
          <h2 className="text-sm font-black text-[#0F172A] dark:text-white mb-4">Price Breakdown</h2>
          <div className="space-y-2.5">
            {[
              { label: 'Product Subtotal', value: order.subtotal ?? 0 },
              { label: 'Freight / Logistics', value: freight?.quoted_amount ?? order.freight_total ?? 0 },
              { label: 'Platform Fee (3%)', value: (order.subtotal ?? 0) * 0.03 },
              { label: 'GST on Fee (18%)', value: (order.subtotal ?? 0) * 0.03 * 0.18 },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{row.label}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatCurrency(row.value)}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 flex justify-between items-center">
              <span className="text-sm font-black text-[#0F172A] dark:text-white">Grand Total</span>
              <span className="text-lg font-black text-[#0F172A] dark:text-white">{formatCurrency(order.grand_total ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* ── Seller Info ──────────────────────────────────────────────── */}
        {order['company_profiles!orders_seller_company_id_fkey'] && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-lg border border-slate-200 dark:border-slate-700">
              {(order['company_profiles!orders_seller_company_id_fkey']?.display_name ?? 'S').charAt(0)}
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Supplied by</p>
              <p className="text-sm font-bold text-[#0F172A] dark:text-white">
                {order['company_profiles!orders_seller_company_id_fkey']?.display_name ??
                 order['company_profiles!orders_seller_company_id_fkey']?.legal_name}
              </p>
              <p className="text-xs text-slate-400">
                {order['company_profiles!orders_seller_company_id_fkey']?.city},&nbsp;
                {order['company_profiles!orders_seller_company_id_fkey']?.state}
              </p>
            </div>
            <Link href="/messages" className="ml-auto text-xs font-bold text-[#B5924D] hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">chat</span>
              Message
            </Link>
          </div>
        )}

        {/* ── Action buttons ───────────────────────────────────────────── */}
        <div className="flex gap-3">
          {order.status === 'delivered' && (
            <Link href={`/orders/${id}/dispute`} className="flex-1 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm px-4 py-3 rounded-xl hover:border-red-400 hover:text-red-600 transition-colors">
              Raise Dispute
            </Link>
          )}
          <Link href={`/account/invoices`} className="flex-1 text-center bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] font-bold text-sm px-4 py-3 rounded-xl hover:bg-[#B5924D] dark:hover:bg-[#B5924D] dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[16px] mr-1 align-middle">receipt_long</span>
            View Invoice
          </Link>
        </div>

      </main>

      <StitchBottomNav />
    </div>
  )
}
