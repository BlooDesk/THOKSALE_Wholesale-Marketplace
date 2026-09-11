import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SellerShell } from '@/components/seller/seller-shell'
import { CompanyProfileForm } from './company-form'

export const dynamic = 'force-dynamic'

export default async function SellerCompanyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/seller/company-profile')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name, email').eq('id', user.id).maybeSingle()

  if (!profile || profile.role !== 'seller') {
    redirect('/account?error=only-sellers')
  }

  const { data: company } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('profile_id', user.id)
    .maybeSingle()

  return (
    <SellerShell currentPath="/seller/company-profile">
      <div className="mb-8">
        <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Storefront</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">Company Profile</h1>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
          Buyers see this information on your storefront. Keep it accurate to get verified faster.
        </p>
      </div>

      <CompanyProfileForm initial={company} userEmail={user.email || ''} />
    </SellerShell>
  )
}
