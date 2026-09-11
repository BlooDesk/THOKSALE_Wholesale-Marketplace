import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/pricing'
import { STATUS_LABELS, STATUS_COLORS, type OrderStatus } from '@/lib/commerce'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AdminOrders(props: { searchParams: Promise<{ status?: string }> }) {
  const sp = await props.searchParams
  const status = sp.status || 'all'
  const supabase = await createClient()
  let query = supabase.from('orders').select('id, order_number, status, currency, grand_total, created_at, buyer:profiles!buyer_id(email, company_profiles(display_name)), seller:profiles!seller_id(company_profiles(display_name))')
    .order('created_at', { ascending: false }).limit(200)
  if (status !== 'all') query = query.eq('status', status as any)
  const { data: orders } = await query

  const statuses = ['all', 'pending', 'accepted', 'awaiting_freight_quote', 'freight_quote_sent', 'freight_approved', 'ready_for_payment', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'] as const

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Fulfilment</span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">Orders</h1>
        </div>
        <form method="GET" className="flex items-center gap-2">
          <select name="status" defaultValue={status} className="h-10 rounded-2xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:border-accent">
            {statuses.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : STATUS_LABELS[s as OrderStatus]}</option>)}
          </select>
          <Button type="submit" variant="outline">Filter</Button>
        </form>
      </div>

      <div className="mt-8 overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-soft">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary/60 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <tr><th className="px-6 py-3.5">Order</th><th className="px-6 py-3.5">Buyer</th><th className="px-6 py-3.5">Seller</th><th className="px-6 py-3.5">Total</th><th className="px-6 py-3.5">Status</th><th className="px-6 py-3.5">Placed</th></tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {(orders || []).map((o: any) => (
              <tr key={o.id} className="hover:bg-secondary/40 transition-colors">
                <td className="px-6 py-4"><Link href={`/orders/${o.id}`} className="font-mono font-semibold text-foreground hover:text-accent transition-colors">{o.order_number}</Link></td>
                <td className="px-6 py-4 text-foreground/85">{o.buyer?.company_profiles?.display_name || o.buyer?.email}</td>
                <td className="px-6 py-4 text-foreground/85">{o.seller?.company_profiles?.display_name || '—'}</td>
                <td className="px-6 py-4 font-semibold text-foreground">{formatCurrency(Number(o.grand_total), o.currency)}</td>
                <td className="px-6 py-4"><span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${STATUS_COLORS[o.status as OrderStatus] || ''}`}>{STATUS_LABELS[o.status as OrderStatus] || o.status}</span></td>
                <td className="px-6 py-4 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
