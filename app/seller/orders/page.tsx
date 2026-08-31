import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SellerShell } from '@/components/seller/seller-shell'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'
import { formatCurrency } from '@/lib/pricing'
import { STATUS_LABELS, STATUS_COLORS, type OrderStatus } from '@/lib/commerce'

export default async function SellerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/seller/orders')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'seller') redirect('/account')

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, currency, grand_total, created_at, buyer:profiles!buyer_id ( full_name, email, company_profiles ( display_name, legal_name ) )')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <SellerShell currentPath="/seller/orders">
      <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Fulfilment</span>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">Incoming orders</h1>

      {(!orders || orders.length === 0) ? (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-border/70 bg-card/60 p-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary"><Package className="h-6 w-6 text-foreground" /></span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No orders yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">When buyers order, you&rsquo;ll see them here.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-soft">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary/60 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <tr><th className="px-6 py-3.5">Order</th><th className="px-6 py-3.5">Buyer</th><th className="px-6 py-3.5">Date</th><th className="px-6 py-3.5">Total</th><th className="px-6 py-3.5">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {orders.map((o: any) => {
                const cp = o.buyer?.company_profiles
                const buyerName = cp?.display_name || cp?.legal_name || o.buyer?.full_name || o.buyer?.email || '—'
                return (
                  <tr key={o.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-4"><Link href={`/seller/orders/${o.id}`} className="font-mono font-semibold text-foreground hover:text-accent transition-colors">{o.order_number}</Link></td>
                    <td className="px-6 py-4 text-foreground/85">{buyerName}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{formatCurrency(Number(o.grand_total), o.currency)}</td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${STATUS_COLORS[o.status as OrderStatus] || ''}`}>{STATUS_LABELS[o.status as OrderStatus] || o.status}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </SellerShell>
  )
}
