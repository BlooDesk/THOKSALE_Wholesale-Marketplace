import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/pricing'
import { STATUS_LABELS, STATUS_COLORS, type OrderStatus } from '@/lib/commerce'
import { StatCard } from '@/components/ui/stat-card'
import { Users, Store, Package, Receipt, TrendingUp, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function count(supabase: any, table: string, filters: Record<string, any> = {}): Promise<number> {
  let q = supabase.from(table).select('*', { head: true, count: 'exact' })
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v)
  const { count } = await q
  return count || 0
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [buyers, sellers, products, orders, rfqs, activeOrders] = await Promise.all([
    count(supabase, 'profiles', { role: 'buyer' }),
    count(supabase, 'profiles', { role: 'seller' }),
    supabase.from('products').select('*', { head: true, count: 'exact' }).is('deleted_at', null).then((r: any) => r.count || 0),
    supabase.from('orders').select('*', { head: true, count: 'exact' }).then((r: any) => r.count || 0),
    supabase.from('rfqs').select('*', { head: true, count: 'exact' }).is('deleted_at', null).then((r: any) => r.count || 0),
    supabase.from('orders').select('grand_total').in('status', ['accepted', 'awaiting_freight_quote', 'freight_quote_sent', 'freight_approved', 'ready_for_payment', 'processing', 'shipped', 'delivered']).then((r: any) => r.data || []),
  ])
  const revenue = (activeOrders as any[]).reduce((n, o) => n + Number(o.grand_total || 0), 0)

  const { data: recent } = await supabase.from('orders').select('id, order_number, status, grand_total, currency, created_at').order('created_at', { ascending: false }).limit(8)

  const cards = [
    { label: 'Buyers', value: buyers.toLocaleString(), icon: Users },
    { label: 'Sellers', value: sellers.toLocaleString(), icon: Store },
    { label: 'Products', value: products.toLocaleString(), icon: Package },
    { label: 'Orders', value: orders.toLocaleString(), icon: Receipt },
    { label: 'RFQs', value: rfqs.toLocaleString(), icon: FileText },
    { label: 'Revenue (GMV)', value: formatCurrency(revenue, 'INR'), icon: TrendingUp },
  ]

  return (
    <>
      <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Overview</span>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Overview of platform activity.</p>

      <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} />
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Recent orders</h2>
        <div className="mt-4 overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-soft">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary/60 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <tr><th className="px-6 py-3.5">Order</th><th className="px-6 py-3.5">Total</th><th className="px-6 py-3.5">Status</th><th className="px-6 py-3.5">Placed</th></tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(recent || []).map((o: any) => (
                <tr key={o.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4"><Link href="/admin/orders" className="font-mono font-semibold text-foreground hover:text-accent transition-colors">{o.order_number}</Link></td>
                  <td className="px-6 py-4 font-semibold text-foreground">{formatCurrency(Number(o.grand_total), o.currency)}</td>
                  <td className="px-6 py-4"><span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${STATUS_COLORS[o.status as OrderStatus] || ''}`}>{STATUS_LABELS[o.status as OrderStatus] || o.status}</span></td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
