import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { CategoryForm, CategoryRowActions } from './categories-client'

export default async function AdminCategories() {
  const supabase = await createClient()
  const [{ data: categories }, { data: industries }] = await Promise.all([
    supabase.from('categories').select('*, industries:industry_id(name, slug)').order('parent_id', { ascending: true, nullsFirst: true }).order('sort_order').limit(500),
    supabase.from('industries').select('id, name').is('deleted_at', null).eq('is_active', true).order('sort_order'),
  ])
  const parents = (categories || []).filter((c: any) => c.parent_id === null)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="serial">CATALOG — CATEGORIES</p>
          <h1 className="mt-3 display-2 text-foreground">Categories</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">Categories and subcategories anchor products to an industry.</p>
        </div>
        <CategoryForm parents={parents} industries={industries || []} />
      </div>

      <div className="mt-8 overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-soft">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary/60 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <tr><th className="px-6 py-3.5">Name</th><th className="px-6 py-3.5">Industry</th><th className="px-6 py-3.5">Slug</th><th className="px-6 py-3.5">Parent</th><th className="px-6 py-3.5">Status</th><th className="px-6 py-3.5" /></tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {(categories || []).map((c: any) => {
              const parent = parents.find((p: any) => p.id === c.parent_id)
              return (
                <tr key={c.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{c.parent_id ? `— ${c.name}` : c.name}</td>
                  <td className="px-6 py-4 text-xs text-foreground/85">{c.industries?.name || <span className="text-muted-foreground">Unassigned</span>}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{c.slug}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{parent?.name || '—'}</td>
                  <td className="px-6 py-4"><Badge variant={c.is_active ? 'success' : 'muted'}>{c.is_active ? 'Active' : 'Disabled'}</Badge></td>
                  <td className="px-6 py-4"><CategoryRowActions category={c} parents={parents} industries={industries || []} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
