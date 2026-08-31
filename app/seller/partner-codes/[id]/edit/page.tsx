import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SellerShell } from '@/components/seller/seller-shell'
import { CodeForm } from '../../code-form'

export default async function EditCodePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/seller/partner-codes/${id}/edit`)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'seller') redirect('/account')

  const { data: code } = await supabase.from('partner_codes').select('*, buyer:profiles!buyer_id(email)').eq('id', id).maybeSingle()
  if (!code) notFound()
  if (code.seller_id !== user.id) redirect('/seller/partner-codes')

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('id, name').eq('seller_id', user.id).is('deleted_at', null).order('name'),
    supabase.from('categories').select('id, name, parent_id').eq('is_active', true).order('name'),
  ])

  const initial: any = { ...code, buyer_email: (code as any).buyer?.email || null }

  return (
    <SellerShell currentPath="/seller/partner-codes">
      <div className="mx-auto max-w-3xl">
        <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Edit contract</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">Edit code <span className="font-mono text-accent">{code.code}</span></h1>
        <div className="mt-8">
          <CodeForm mode="edit" id={id} initial={initial} products={products || []} categories={(categories || []).filter((c: any) => c.parent_id !== null)} />
        </div>
      </div>
    </SellerShell>
  )
}
