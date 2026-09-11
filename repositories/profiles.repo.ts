// ============================================================
// THOKSALE — Profiles Repository
// Raw Supabase queries for profiles, company_profiles.
// ============================================================

import { createClient } from '@/lib/supabase/server'

export async function fetchProfile(userId: string) {
  const supabase = await createClient()
  return supabase
    .from('profiles')
    .select('id, role, full_name, email, phone, avatar_url, is_active, created_at')
    .eq('id', userId)
    .maybeSingle()
}

export async function fetchCompanyProfile(userId: string) {
  const supabase = await createClient()
  return supabase
    .from('company_profiles')
    .select(`
      id, profile_id, legal_name, display_name, tax_id, business_type,
      address_line1, address_line2, city, state, postal_code, country,
      contact_email, contact_phone, logo_url, description,
      kyc_status, verified_at, rating, website, pan, msme_number,
      business_types ( name, code ),
      created_at, updated_at
    `)
    .eq('profile_id', userId)
    .maybeSingle()
}

export async function fetchNotificationCount(userId: string) {
  const supabase = await createClient()
  return supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
}

export async function fetchWalletBalance(userId: string) {
  // Once promo_wallets table exists this returns real balance.
  // Currently returns 0 gracefully.
  const supabase = await createClient()
  const { data } = await supabase
    .from('promo_wallets' as any)
    .select('balance, expires_at')
    .eq('user_id', userId)
    .maybeSingle()
    .catch(() => ({ data: null }))
  return (data as any)?.balance ?? 0
}
