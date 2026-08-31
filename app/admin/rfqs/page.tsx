import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'

export default async function AdminRfqs() {
  const supabase = await createClient()
  const { data: rfqs } = await supabase.from('rfqs')
    .select('id, rfq_number, title, status, quantity, unit, target_price, currency, created_at, buyer:profiles!buyer_id(email, company_profiles(display_name)), rfq_responses(id)')
    .order('created_at', { ascending: false }).limit(200)

  return (
    <>
      <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Sourcing</span>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">RFQs</h1>
      <div className="mt-8 overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-soft">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary/60 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <tr><th className="px-6 py-3.5">RFQ</th><th className="px-6 py-3.5">Title</th><th className="px-6 py-3.5">Buyer</th><th className="px-6 py-3.5">Qty</th><th className="px-6 py-3.5">Responses</th><th className="px-6 py-3.5">Status</th><th className="px-6 py-3.5">Created</th></tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {(rfqs || []).map((r: any) => (
              <tr key={r.id} className="hover:bg-secondary/40 transition-colors">
                <td className="px-6 py-4"><Link href={`/rfq/${r.id}`} className="font-mono font-semibold text-foreground hover:text-accent transition-colors">{r.rfq_number}</Link></td>
                <td className="px-6 py-4 text-foreground/85">{r.title}</td>
                <td className="px-6 py-4 text-foreground/85">{r.buyer?.company_profiles?.display_name || r.buyer?.email}</td>
                <td className="px-6 py-4 text-foreground/85">{r.quantity} {r.unit}</td>
                <td className="px-6 py-4 text-foreground/85">{(r.rfq_responses || []).length}</td>
                <td className="px-6 py-4"><Badge variant="secondary" className="capitalize">{r.status}</Badge></td>
                <td className="px-6 py-4 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
