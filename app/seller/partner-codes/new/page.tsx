import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SellerShell } from '@/components/seller/seller-shell'
import { CodeForm } from '../code-form'

export default async function NewCodePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/seller/partner-codes/new')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'seller') redirect('/account')

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('id, name').eq('seller_id', user.id).is('deleted_at', null).order('name'),
    supabase.from('categories').select('id, name, parent_id').eq('is_active', true).order('name'),
  ])

  return (
    <SellerShell currentPath="/seller/partner-codes">
      <div className="mx-auto max-w-3xl">
        <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Contract</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">New partner code</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Contract pricing for a specific buyer, product, or category.</p>
        <div className="mt-8">
          <CodeForm mode="create" products={products || []} categories={(categories || []).filter((c: any) => c.parent_id !== null)} />
        </div>
      </div>
    </SellerShell>
  )
}
