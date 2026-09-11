import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { IndustryEditor, IndustryRowActions, NewIndustryButton } from './industries-client'
import { Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminIndustries() {
  const supabase = await createClient()
  const { data: industries } = await supabase
    .from('industries')
    .select('id, name, slug, description, icon_name, sort_order, is_active, deleted_at, updated_at')
    .is('deleted_at', null)
    .order('sort_order').order('name')
    .limit(200)

  const { data: countsRaw } = await supabase
    .from('categories').select('industry_id').is('deleted_at', null)
  const counts: Record<string, number> = {}
  ;(countsRaw || []).forEach((c: any) => { if (c.industry_id) counts[c.industry_id] = (counts[c.industry_id] || 0) + 1 })

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="serial">01 — CATALOG ROOT</p>
          <h1 className="mt-3 display-2 text-foreground">Industries</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">Top-level segments of the exchange. Every category belongs to an industry.</p>
        </div>
        <NewIndustryButton />
      </div>

      {(!industries || industries.length === 0) ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border/70 bg-card/60 p-14 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary"><Building2 className="h-6 w-6 text-foreground" /></span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No industries yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Run the migration or add your first industry.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-soft">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary/60 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">Industry</th>
                <th className="px-6 py-3.5">Slug</th>
                <th className="px-6 py-3.5 num">Order</th>
                <th className="px-6 py-3.5 num">Categories</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(industries as any[]).map((i) => (
                <tr key={i.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{i.name}</div>
                    {i.description && <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{i.description}</div>}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{i.slug}</td>
                  <td className="px-6 py-4 num text-foreground/85">{i.sort_order}</td>
                  <td className="px-6 py-4 num text-foreground/85">{counts[i.id] || 0}</td>
                  <td className="px-6 py-4"><Badge variant={i.is_active ? 'success' : 'muted'}>{i.is_active ? 'Active' : 'Disabled'}</Badge></td>
                  <td className="px-6 py-4"><IndustryRowActions industry={i} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <IndustryEditor />
    </>
  )
}
