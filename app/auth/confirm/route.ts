import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const origin = url.origin

  // ── Handle OAuth code exchange (Google, GitHub, etc.) ──────────────────────
  const code = url.searchParams.get('code')
  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
      )
    }

    // Create profile if first-time OAuth user
    if (data.user) {
      try {
        const admin = createAdminClient()
        const { data: existing } = await admin
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!existing) {
          await admin.from('profiles').upsert(
            {
              id: data.user.id,
              role: 'buyer', // OAuth users default to buyer; they can upgrade later
              full_name:
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                data.user.email?.split('@')[0] ||
                'Member',
              email: data.user.email,
              phone: data.user.user_metadata?.phone || null,
              avatar_url: data.user.user_metadata?.avatar_url || null,
              is_active: true,
            },
            { onConflict: 'id' }
          )
        }
      } catch (e: any) {
        console.error('OAuth profile creation error:', e?.message)
      }
    }

    const next = url.searchParams.get('next') ?? '/account'
    return NextResponse.redirect(new URL(next, origin))
  }

  // ── Handle email OTP links (signup confirm, password reset) ────────────────
  const token_hash = url.searchParams.get('token_hash')
  const type = (url.searchParams.get('type') as EmailOtpType | null) ?? null
  const next = url.searchParams.get('next') ?? '/account'

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/login?error=invalid-link', origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash })

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
    )
  }

  return NextResponse.redirect(new URL(next, origin))
}
