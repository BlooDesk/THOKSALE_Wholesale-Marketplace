import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SellerShell } from '@/components/seller/seller-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Ticket } from 'lucide-react'
import { CodeRowActions } from './row-actions'

export const dynamic = 'force-dynamic'

export default async function PartnerCodesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/seller/partner-codes')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'seller') redirect('/account?error=only-sellers')

  const { data: codes } = await supabase
    .from('partner_codes')
    .select('id, code, discount_type, discount_value, product_id, category_id, buyer_id, valid_from, valid_until, max_uses, used_count, is_active, deleted_at, updated_at')
    .eq('seller_id', user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  return (
    <SellerShell currentPath="/seller/partner-codes">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Contract pricing</span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">Partner Codes</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Private pricing for specific buyers, products or categories.</p>
        </div>
        <Link href="/seller/partner-codes/new"><Button variant="accent"><Plus className="mr-1 h-4 w-4" /> New code</Button></Link>
      </div>

      {(!codes || codes.length === 0) ? (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-border/70 bg-card/60 p-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary"><Ticket className="h-6 w-6 text-foreground" /></span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No partner codes yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create a code to offer contract pricing to specific buyers.</p>
          <Link href="/seller/partner-codes/new" className="mt-5"><Button variant="accent"><Plus className="mr-1 h-4 w-4" /> Create code</Button></Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-soft">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary/60 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Discount</th>
                <th className="px-6 py-3.5">Scope</th>
                <th className="px-6 py-3.5">Validity</th>
                <th className="px-6 py-3.5">Uses</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {codes.map((c: any) => (
                <tr key={c.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/seller/partner-codes/${c.id}/edit`} className="font-mono text-sm font-semibold text-foreground hover:text-accent transition-colors">{c.code}</Link>
                  </td>
                  <td className="px-6 py-4 text-foreground/85">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% off` :
                     c.discount_type === 'flat' ? `₹${c.discount_value} off` :
                     `₹${c.discount_value} fixed`}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="text-foreground/85">{c.product_id ? 'Product' : c.category_id ? 'Category' : 'Seller-wide'}</span>
                    {c.buyer_id && <span className="ml-1.5 rounded-full bg-accent/10 [color:hsl(var(--accent))] px-2 py-0.5 text-[10px] font-semibold">Private</span>}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td className="px-6 py-4 text-xs text-foreground/85">
                    {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={c.is_active ? 'success' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <CodeRowActions id={c.id} code={c.code} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SellerShell>
  )
}
