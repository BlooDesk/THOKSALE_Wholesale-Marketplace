// =====================================================================
// ThokSale — Consolidated Auth Helpers (M3, M9)
// Single source of truth for auth context + shared Result type.
// =====================================================================

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---- Shared Result type (M9) ------------------------------------------
export type Result<T = null> = { ok: true; data?: T; error?: never } | { ok: false; error: string; data?: never }

// ---- Auth context types -----------------------------------------------
export type AuthCtx = {
  ok: true
  user: { id: string; email?: string | null }
  supabase: SupabaseClient
  admin: SupabaseClient
  error?: never
}

export type AuthFailure = {
  ok: false
  error: string
  code: 'unauthenticated' | 'not-buyer' | 'not-seller' | 'not-admin'
}

export type SellerCtx = AuthCtx | AuthFailure
export type BuyerCtx = AuthCtx | AuthFailure
export type AdminCtx = AuthCtx | AuthFailure
export type UserCtx = AuthCtx | { ok: false; error: string; code: 'unauthenticated' }

// ---- Helpers -----------------------------------------------------------

/** Require any authenticated user (no role check). */
export async function requireUser(): Promise<UserCtx> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated.', code: 'unauthenticated' }
  return { ok: true, user, supabase, admin: createAdminClient() }
}

/** Require an authenticated buyer. */
export async function requireBuyer(): Promise<BuyerCtx> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Please sign in.', code: 'unauthenticated' }
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'buyer') return { ok: false, error: 'Only buyers can do this.', code: 'not-buyer' }
  return { ok: true, user, supabase, admin: createAdminClient() }
}

/** Require an authenticated seller. */
export async function requireSeller(): Promise<SellerCtx> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated.', code: 'unauthenticated' }
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'seller') return { ok: false, error: 'Only sellers can do this.', code: 'not-seller' }
  return { ok: true, user, supabase, admin: createAdminClient() }
}

/** Require an authenticated, active admin. */
export async function requireAdmin(): Promise<AdminCtx> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated.', code: 'unauthenticated' }
  const { data: profile } = await supabase
    .from('profiles').select('role, is_active').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin' || !profile?.is_active) {
    return { ok: false, error: 'Admins only.', code: 'not-admin' }
  }
  return { ok: true, user, supabase, admin: createAdminClient() }
}
