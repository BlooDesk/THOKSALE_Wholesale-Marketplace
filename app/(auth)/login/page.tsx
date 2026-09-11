'use client'

import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthShell, OrDivider, AuthHeading } from '@/components/auth/auth-shell'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { PasswordInput } from '@/components/auth/password-input'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/account'
  const urlError = params.get('error')
  const { refreshProfile } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [pending, start] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields.')
      return
    }
    start(async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })

        if (error) {
          if (error.message.toLowerCase().includes('invalid')) {
            toast.error('Invalid email or password. Please check your credentials.')
          } else if (error.message.toLowerCase().includes('email')) {
            toast.error('Please verify your email before signing in.')
          } else {
            toast.error(error.message)
          }
          return
        }

        if (data.user) {
          await refreshProfile()
          toast.success(`Welcome back! 👋`)
          router.push(next)
          router.refresh()
        }
      } catch (err: any) {
        toast.error(err?.message || 'Login failed. Please try again.')
      }
    })
  }

  return (
    <>
      <AuthHeading
        title="Sign In to Trade Console"
        subtitle="Access factory pricing, RFQ workspaces, and credit terms."
      />

      {/* URL error from OAuth callback */}
      {urlError && (
        <div className="mb-5 p-3.5 rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-800/50 dark:bg-rose-950/30 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <span className="material-symbols-outlined text-[15px] mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <span>
            {urlError === 'invalid-link'
              ? 'Your sign-in link has expired. Please try again.'
              : urlError}
          </span>
        </div>
      )}

      {/* Google SSO */}
      <GoogleAuthButton label="Sign in with Google" />
      <OrDivider />

      {/* Email + Password form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Corporate Email
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              mail
            </span>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40 focus:border-[#B5924D] transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-bold text-[#B5924D] hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
          />
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:border-[#B5924D] peer-checked:bg-[#B5924D] transition-all flex items-center justify-center">
              {rememberMe && (
                <span className="material-symbols-outlined text-white text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check
                </span>
              )}
            </div>
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
            Remember me for 30 days
          </span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-[#0F172A] hover:bg-[#B5924D] text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {pending ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In to Trade Console</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-slate-500">
        New to THOKSALE?{' '}
        <Link href="/register" className="font-bold text-[#B5924D] hover:underline transition-colors">
          Create wholesale account →
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-[#B5924D] border-t-transparent animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
