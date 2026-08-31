import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { UnitEditor, UnitRowActions, NewUnitButton } from './units-client'

export default async function AdminUnits() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('units')
    .select('id, code, name, symbol, unit_type, sort_order, is_active')
    .is('deleted_at', null)
    .order('unit_type').order('sort_order')

  const groups: Record<string, any[]> = { measurement: [], packaging: [] }
  ;(data || []).forEach((u: any) => { (groups[u.unit_type] || (groups[u.unit_type] = [])).push(u) })

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="serial">03 — UNIT REGISTRY</p>
          <h1 className="mt-3 display-2 text-foreground">Units of trade</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">Measurement and packaging units used across product listings, MOQ and freight.</p>
        </div>
        <NewUnitButton />
      </div>

      {(['measurement','packaging'] as const).map((t) => (
        <section key={t} className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-foreground capitalize">{t} units <span className="num ml-1 text-sm font-normal text-muted-foreground">({groups[t].length})</span></h2>
          <div className="mt-4 overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-soft">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/60 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <tr><th className="px-6 py-3">Code</th><th className="px-6 py-3">Name</th><th className="px-6 py-3">Symbol</th><th className="px-6 py-3 num">Order</th><th className="px-6 py-3">Status</th><th className="px-6 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {groups[t].map((u: any) => (
                  <tr key={u.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-xs text-foreground/85">{u.code}</td>
                    <td className="px-6 py-3.5 text-foreground">{u.name}</td>
                    <td className="px-6 py-3.5 text-foreground/85">{u.symbol || '—'}</td>
                    <td className="px-6 py-3.5 num text-foreground/85">{u.sort_order}</td>
                    <td className="px-6 py-3.5"><Badge variant={u.is_active ? 'success' : 'muted'}>{u.is_active ? 'Active' : 'Disabled'}</Badge></td>
                    <td className="px-6 py-3.5"><UnitRowActions unit={u} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <UnitEditor />
    </>
  )
}
