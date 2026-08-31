import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SellerShell } from '@/components/seller/seller-shell'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'

export default async function SellerRfqInbox() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/seller/rfq')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'seller') redirect('/account')

  const { data: rfqs } = await supabase
    .from('rfqs')
    .select('id, rfq_number, title, category_id, status, quantity, unit, target_price, currency, created_at, delivery_deadline, is_public, invited_sellers, rfq_responses(id, seller_id, status)')
    .in('status', ['open', 'quoted', 'in_review'])
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const visible = (rfqs || []).filter((r: any) => r.is_public || (r.invited_sellers || []).includes(user.id))

  return (
    <SellerShell currentPath="/seller/rfq">
      <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Inbox</span>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">Open RFQs</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Buyer requests looking for quotes.</p>

      {visible.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border/70 bg-card/60 p-14 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary"><FileText className="h-6 w-6 text-foreground" /></span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No open RFQs</h3>
          <p className="mt-1 text-sm text-muted-foreground">Check back later.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {visible.map((r: any) => {
            const mine = (r.rfq_responses || []).find((rr: any) => rr.seller_id === user.id)
            return (
              <Link key={r.id} href={`/rfq/${r.id}`} className="block rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-premium hover:border-border">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{r.rfq_number}</div>
                    <div className="mt-1 text-[15px] font-semibold text-foreground">{r.title}</div>
                    <div className="mt-1.5 text-xs text-muted-foreground">Qty {r.quantity} {r.unit} · Target {r.target_price ? `${r.currency} ${r.target_price}` : '—'} · Deadline {r.delivery_deadline || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {mine ? <Badge variant="accent" className="capitalize">Your quote · {mine.status}</Badge> : <Badge variant="secondary">New</Badge>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </SellerShell>
  )
}
