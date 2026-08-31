import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { AttrEditor, AttrRowActions, NewAttrButton } from './attribute-templates-client'
import { ListTree, ChevronRight } from 'lucide-react'

export default async function AdminAttributeTemplates(props: { searchParams: Promise<{ category?: string }> }) {
  const sp = await props.searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, industry_id, industries:industry_id(name), parent:categories!parent_id(name)')
    .is('deleted_at', null)
    .order('name')
    .limit(500)

  const selectedId = sp.category || (categories && categories[0]?.id)
  const selected = (categories || []).find((c: any) => c.id === selectedId)

  let attrs: any[] = []
  if (selectedId) {
    const { data } = await supabase
      .from('attribute_definitions')
      .select('id, key, label, attr_type, options, unit, is_required, is_filterable, is_variant, sort_order, is_active')
      .eq('category_id', selectedId)
      .is('deleted_at', null)
      .order('sort_order').order('label')
    attrs = data || []
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="serial">05 — ATTRIBUTE TEMPLATES</p>
          <h1 className="mt-3 display-2 text-foreground">Attributes</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">Per-category schema for product specs, filters, variants and search.</p>
        </div>
        {selectedId && <NewAttrButton categoryId={selectedId} />}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <aside className="rounded-3xl border border-border/60 bg-card p-3 shadow-soft h-fit max-h-[70vh] overflow-auto">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Categories</div>
          <ul className="space-y-0.5">
            {(categories as any[] || []).map((c) => {
              const industryName = (c.industries as any)?.name
              const parentName = (c.parent as any)?.name
              return (
                <li key={c.id}>
                  <Link href={`/admin/attribute-templates?category=${c.id}`}
                    className={`flex items-start justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${c.id === selectedId ? 'bg-secondary text-foreground' : 'text-foreground/80 hover:bg-secondary/60'}`}>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{c.name}</div>
                      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {industryName ? `${industryName} · ` : ''}{parentName ? `${parentName}` : c.parent_id ? '—' : 'Root'}
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </aside>

        <section>
          {!selected ? (
            <div className="rounded-3xl border border-dashed border-border/70 bg-card/60 p-14 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary"><ListTree className="h-6 w-6 text-foreground" /></span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Pick a category</h3>
              <p className="mt-1 text-sm text-muted-foreground">Then define its attribute template.</p>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Template for</div>
                <div className="mt-2 text-xl font-bold tracking-tight text-foreground">{selected.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{attrs.length} attribute{attrs.length === 1 ? '' : 's'}</div>
              </div>

              {attrs.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-border/70 bg-card/60 p-14 text-center">
                  <h3 className="text-lg font-semibold text-foreground">No attributes defined yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Add your first attribute for this category.</p>
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-soft">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-secondary/60 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      <tr><th className="px-6 py-3">Label</th><th className="px-6 py-3">Key</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Flags</th><th className="px-6 py-3 num">Order</th><th className="px-6 py-3" /></tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {attrs.map((a) => (
                        <tr key={a.id} className="hover:bg-secondary/40 transition-colors">
                          <td className="px-6 py-3.5 font-semibold text-foreground">{a.label}</td>
                          <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">{a.key}</td>
                          <td className="px-6 py-3.5"><Badge variant="secondary" className="capitalize">{String(a.attr_type).replace('_',' ')}</Badge></td>
                          <td className="px-6 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {a.is_required && <Badge variant="accent">Required</Badge>}
                              {a.is_filterable && <Badge variant="secondary">Filterable</Badge>}
                              {a.is_variant && <Badge variant="secondary">Variant</Badge>}
                              {!a.is_active && <Badge variant="muted">Off</Badge>}
                            </div>
                          </td>
                          <td className="px-6 py-3.5 num text-foreground/85">{a.sort_order}</td>
                          <td className="px-6 py-3.5"><AttrRowActions attr={a} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <AttrEditor />
    </>
  )
}
