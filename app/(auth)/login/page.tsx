'use client'

import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/auth-provider'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/account'
  const { refreshProfile } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, start] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) {
          toast.error(error.message || 'Invalid email or password.')
          return
        }

        if (data.user) {
          await refreshProfile()
          toast.success(`Welcome back, ${data.user.user_metadata?.full_name || data.user.email}!`)
          router.push(next)
          router.refresh()
        }
      } catch (err: any) {
        toast.error(err?.message || 'Login failed. Please check your credentials.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Corporate Email
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            mail
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Password
          </label>
          <Link href="/forgot-password" className="text-[11px] font-bold text-[#B5924D] hover:underline">
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            lock
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full mt-2 bg-[#0F172A] hover:bg-[#B5924D] text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <span>{pending ? 'Signing in...' : 'Sign In to Trade Console'}</span>
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-mono text-2xl font-black tracking-tighter text-[#0F172A] dark:text-white">
              THOK<span className="text-[#B5924D]">SALE</span>
            </span>
          </Link>
          <h1 className="text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Wholesale B2B Login
          </h1>
          <p className="text-xs text-slate-500">
            Access direct factory pricing, RFQ workspaces, and credit terms.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-4 text-xs text-slate-400">Loading sign in form...</div>}>
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          New to THOKSALE?{' '}
          <Link href="/register" className="font-bold text-[#B5924D] hover:underline">
            Register Wholesale Account
          </Link>
        </div>
      </div>
    </div>
  )
}
