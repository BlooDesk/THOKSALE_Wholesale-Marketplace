import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { BusinessTypeEditor, BusinessTypeRowActions, NewBusinessTypeButton } from './business-types-client'
import { Briefcase } from 'lucide-react'

export default async function AdminBusinessTypes() {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('business_types')
    .select('id, code, name, description, sort_order, is_active')
    .is('deleted_at', null)
    .order('sort_order')

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="serial">04 — BUSINESS ONTOLOGY</p>
          <h1 className="mt-3 display-2 text-foreground">Business types</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">Controlled vocabulary for seller onboarding. Manufacturer, Distributor, Wholesaler, etc.</p>
        </div>
        <NewBusinessTypeButton />
      </div>

      {(!rows || rows.length === 0) ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border/70 bg-card/60 p-14 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary"><Briefcase className="h-6 w-6 text-foreground" /></span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No business types yet</h3>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-soft">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary/60 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <tr><th className="px-6 py-3.5">Name</th><th className="px-6 py-3.5">Code</th><th className="px-6 py-3.5">Description</th><th className="px-6 py-3.5 num">Order</th><th className="px-6 py-3.5">Status</th><th className="px-6 py-3.5" /></tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(rows as any[]).map((r) => (
                <tr key={r.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{r.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{r.code}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.description || '—'}</td>
                  <td className="px-6 py-4 num text-foreground/85">{r.sort_order}</td>
                  <td className="px-6 py-4"><Badge variant={r.is_active ? 'success' : 'muted'}>{r.is_active ? 'Active' : 'Disabled'}</Badge></td>
                  <td className="px-6 py-4"><BusinessTypeRowActions row={r} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <BusinessTypeEditor />
    </>
  )
}
