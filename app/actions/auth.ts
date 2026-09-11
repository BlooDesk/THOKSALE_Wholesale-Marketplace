'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

export type Role = 'buyer' | 'seller'

export type SignUpInput = {
  email: string
  password: string
  full_name: string
  phone: string
  role: Role
  company_name?: string
  gst_number?: string
}

export type ActionResult<T = undefined> =
  | { ok: true; error?: never; data?: T }
  | { ok: false; error: string; data?: never }

function siteUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export async function signUp(input: SignUpInput): Promise<ActionResult> {
  if (!input.email || !input.password) {
    return { ok: false, error: 'Email and password are required.' }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(input.email)) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }
  if (input.password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' }
  }
  if (!/[A-Z]/.test(input.password)) {
    return { ok: false, error: 'Password must contain at least one uppercase letter.' }
  }
  if (!/[0-9]/.test(input.password)) {
    return { ok: false, error: 'Password must contain at least one number.' }
  }
  if (!/[^A-Za-z0-9]/.test(input.password)) {
    return { ok: false, error: 'Password must contain at least one special character.' }
  }
  if (input.role === 'seller') {
    if (!input.company_name) {
      return { ok: false, error: 'Company name is required for sellers.' }
    }
    if (!input.gst_number) {
      return { ok: false, error: 'GSTIN is required for sellers.' }
    }
    if (!GSTIN_REGEX.test(input.gst_number.toUpperCase())) {
      return { ok: false, error: 'Invalid GSTIN format. Expected format: 27AABCA1234F1Z5' }
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/confirm?next=/account`,
      data: {
        full_name: input.full_name,
        phone: input.phone,
        role: input.role,
        company_name: input.company_name ?? null,
        gst_number: input.gst_number ?? null,
      },
    },
  })

  if (error) return { ok: false, error: error.message }
  if (!data.user) return { ok: false, error: 'Signup failed. Please try again.' }

  // Create profile + company_profile server-side using service role (bypasses RLS)
  try {
    const admin = createAdminClient()

    const { error: pErr } = await admin.from('profiles').upsert(
      {
        id: data.user.id,
        role: input.role,
        full_name: input.full_name,
        email: input.email,
        phone: input.phone,
        is_active: true,
      },
      { onConflict: 'id' }
    )
    if (pErr) console.error('profiles upsert error:', pErr.message)

    if (input.role === 'seller') {
      const { error: cErr } = await admin.from('company_profiles').upsert(
        {
          profile_id: data.user.id,
          legal_name: input.company_name!,
          display_name: input.company_name!,
          tax_id: input.gst_number!,
          contact_email: input.email,
          contact_phone: input.phone,
        },
        { onConflict: 'profile_id' }
      )
      if (cErr) console.error('company_profiles upsert error:', cErr.message)
    }
  } catch (e: any) {
    console.error('profile creation exception:', e?.message)
  }

  return { ok: true }
}

export async function signIn(input: {
  email: string
  password: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  if (!email) return { ok: false, error: 'Email is required.' }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return { ok: false, error: 'Please enter a valid email address.' }
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/reset-password`,
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function updatePassword(newPassword: string): Promise<ActionResult> {
  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' }
  }
  if (!/[A-Z]/.test(newPassword)) {
    return { ok: false, error: 'Password must contain at least one uppercase letter.' }
  }
  if (!/[0-9]/.test(newPassword)) {
    return { ok: false, error: 'Password must contain at least one number.' }
  }
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function resendVerification(email: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${siteUrl()}/auth/confirm?next=/account` },
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function signInWithGoogle(): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl()}/auth/confirm?next=/account`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
  if (error || !data.url) {
    return { ok: false, error: error?.message || 'Google sign-in failed.' }
  }
  return { ok: true, data: { url: data.url } }
}
