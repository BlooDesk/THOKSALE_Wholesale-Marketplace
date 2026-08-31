import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SellerShell } from '@/components/seller/seller-shell'
import { ProductForm } from '../product-form'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/seller/products/new')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'seller') redirect('/account?error=only-sellers')

  const [{ data: industries }, { data: brands }, { data: units }] = await Promise.all([
    supabase.from('industries').select('id, name').is('deleted_at', null).eq('is_active', true).order('sort_order').order('name'),
    supabase.from('brands').select('id, name').is('deleted_at', null).eq('is_active', true).order('name'),
    supabase.from('units').select('id, name, symbol, unit_type').is('deleted_at', null).eq('is_active', true).order('unit_type').order('name'),
  ])

  return (
    <SellerShell currentPath="/seller/products">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />New listing</span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">Add a new product</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Products start in “Draft” until you publish them.</p>
        </div>
        <ProductForm
          mode="create"
          industries={industries || []}
          brands={brands || []}
          units={units || []}
        />
      </div>
    </SellerShell>
  )
}
