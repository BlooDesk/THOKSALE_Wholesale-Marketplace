import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get('token_hash')
  const type = (url.searchParams.get('type') as EmailOtpType | null) ?? null
  const next = url.searchParams.get('next') ?? '/account'

  if (!token_hash || !type) {
    const bad = new URL(url)
    bad.pathname = '/login'
    bad.searchParams.set('error', 'invalid-link')
    bad.searchParams.delete('token_hash')
    bad.searchParams.delete('type')
    return NextResponse.redirect(bad)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash })

  const redirectUrl = new URL(url)
  redirectUrl.searchParams.delete('token_hash')
  redirectUrl.searchParams.delete('type')
  redirectUrl.searchParams.delete('next')

  if (error) {
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('error', error.message)
    return NextResponse.redirect(redirectUrl)
  }

  redirectUrl.pathname = next
  return NextResponse.redirect(redirectUrl)
}
