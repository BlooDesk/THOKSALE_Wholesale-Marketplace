'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type CompanyInput = {
  legal_name: string
  display_name?: string | null
  tax_id?: string | null
  registration_number?: string | null
  business_type?: string | null
  website?: string | null
  description?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  logo_url?: string | null
}

export type Result<T = null> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

function validate(input: CompanyInput): string | null {
  if (!input.legal_name || input.legal_name.trim().length < 2) {
    return 'Legal company name is required (min 2 chars).'
  }
  if (input.website && !/^https?:\/\//i.test(input.website)) {
    return 'Website must start with http:// or https://'
  }
  if (input.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contact_email)) {
    return 'Contact email is invalid.'
  }
  if (input.postal_code && !/^[A-Za-z0-9\s-]{3,12}$/.test(input.postal_code)) {
    return 'Postal code looks invalid.'
  }
  if (
    input.tax_id &&
    !/^[0-9A-Z]{8,20}$/.test(input.tax_id.replace(/\s/g, '').toUpperCase())
  ) {
    return 'GST / Tax ID looks invalid.'
  }
  return null
}

async function requireSeller() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' as const }
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'seller') return { error: 'Only sellers can access this.' as const }
  return { user, supabase }
}

export async function updateCompanyProfile(input: CompanyInput): Promise<Result> {
  const ctx = await requireSeller()
  if ('error' in ctx) return { ok: false, error: ctx.error }
  const err = validate(input)
  if (err) return { ok: false, error: err }

  const admin = createAdminClient()
  const payload = {
    profile_id: ctx.user.id,
    legal_name: input.legal_name.trim(),
    display_name: input.display_name?.trim() || input.legal_name.trim(),
    tax_id: input.tax_id?.trim() || null,
    registration_number: input.registration_number?.trim() || null,
    business_type: input.business_type || null,
    website: input.website?.trim() || null,
    description: input.description?.trim() || null,
    address_line1: input.address_line1?.trim() || null,
    address_line2: input.address_line2?.trim() || null,
    city: input.city?.trim() || null,
    state: input.state?.trim() || null,
    postal_code: input.postal_code?.trim() || null,
    country: input.country?.trim() || null,
    contact_email: input.contact_email?.trim() || null,
    contact_phone: input.contact_phone?.trim() || null,
    logo_url: input.logo_url || null,
  }

  const { error } = await admin
    .from('company_profiles')
    .upsert(payload, { onConflict: 'profile_id' })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/seller/company-profile')
  return { ok: true }
}

export async function deleteLogo(): Promise<Result> {
  const ctx = await requireSeller()
  if ('error' in ctx) return { ok: false, error: ctx.error }
  const admin = createAdminClient()

  // find current logo
  const { data: company } = await admin
    .from('company_profiles').select('logo_url').eq('profile_id', ctx.user.id).maybeSingle()

  if (company?.logo_url) {
    // Remove from storage if URL points to our bucket
    const marker = '/storage/v1/object/public/company-logos/'
    const idx = company.logo_url.indexOf(marker)
    if (idx > -1) {
      const path = company.logo_url.slice(idx + marker.length)
      await admin.storage.from('company-logos').remove([path]).catch(() => {})
    }
  }

  const { error } = await admin
    .from('company_profiles')
    .update({ logo_url: null })
    .eq('profile_id', ctx.user.id)

  if (error) return { ok: false, error: error.message }
  revalidatePath('/seller/company-profile')
  return { ok: true }
}
