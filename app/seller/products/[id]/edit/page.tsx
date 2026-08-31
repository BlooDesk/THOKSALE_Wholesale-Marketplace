import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SellerShell } from '@/components/seller/seller-shell'
import { ProductForm } from '../../product-form'

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/seller/products/${id}/edit`)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'seller') redirect('/account?error=only-sellers')

  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(id, url, is_primary, sort_order), product_attributes(attribute_id, value_text, value_number, value_boolean, value_json)')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!product) notFound()
  if (product.seller_id !== user.id) redirect('/seller/products?error=not-your-product')

  const [{ data: industries }, { data: brands }, { data: units }] = await Promise.all([
    supabase.from('industries').select('id, name').is('deleted_at', null).eq('is_active', true).order('sort_order').order('name'),
    supabase.from('brands').select('id, name').is('deleted_at', null).eq('is_active', true).order('name'),
    supabase.from('units').select('id, name, symbol, unit_type').is('deleted_at', null).eq('is_active', true).order('unit_type').order('name'),
  ])

  // Flatten product_attributes into { [attribute_id]: value } for the editor
  const existingAttributes: Record<string, any> = {}
  ;((product as any).product_attributes || []).forEach((pa: any) => {
    if (pa.value_boolean !== null && pa.value_boolean !== undefined) existingAttributes[pa.attribute_id] = pa.value_boolean
    else if (pa.value_number !== null && pa.value_number !== undefined) existingAttributes[pa.attribute_id] = pa.value_number
    else if (pa.value_json !== null && pa.value_json !== undefined) existingAttributes[pa.attribute_id] = pa.value_json
    else if (pa.value_text !== null && pa.value_text !== undefined) existingAttributes[pa.attribute_id] = pa.value_text
  })

  return (
    <SellerShell currentPath="/seller/products">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Editing</span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">Edit product</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Changes reflect on your storefront immediately once status is active.</p>
        </div>
        <ProductForm
          mode="edit"
          industries={industries || []}
          brands={brands || []}
          units={units || []}
          product={product}
          existingImages={((product as any).product_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order)}
          existingAttributes={existingAttributes}
        />
      </div>
    </SellerShell>
  )
}
