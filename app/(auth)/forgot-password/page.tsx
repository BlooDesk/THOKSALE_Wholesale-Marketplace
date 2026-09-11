'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { requestPasswordReset } from '@/app/actions/auth'
import { AuthShell, AuthHeading } from '@/components/auth/auth-shell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [pending, start] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await requestPasswordReset(email.trim().toLowerCase())
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setSent(true)
    })
  }

  return (
    <AuthShell>
      {sent ? (
        <div className="space-y-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 ring-8 ring-emerald-50 dark:ring-emerald-900/20">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              mark_email_read
            </span>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">Check your inbox</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
              We've sent a password reset link to{' '}
              <strong className="text-[#0F172A] dark:text-white">{email}</strong>.
              It will expire in 1 hour.
            </p>
          </div>

          {/* Tips */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Didn't receive the email?</p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              {[
                'Check your spam / junk folder',
                'Make sure this is your registered email',
                'Allow 2–3 minutes for delivery',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[13px] text-[#B5924D] mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    info
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setSent(false)}
              className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#B5924D] text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#B5924D] transition-all"
            >
              Try a different email
            </button>
            <Link
              href="/login"
              className="block w-full text-center py-3 rounded-xl bg-[#0F172A] hover:bg-[#B5924D] text-white text-sm font-bold transition-all shadow-sm hover:shadow-md"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <>
          <AuthHeading
            title="Reset Your Password"
            subtitle="Enter your registered corporate email and we'll send you a secure reset link."
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Corporate Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  mail
                </span>
                <input
                  id="reset-email"
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
                  <span>Sending link...</span>
                </>
              ) : (
                <>
                  <span>Send Password Reset Link</span>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remembered your password?{' '}
            <Link href="/login" className="font-bold text-[#B5924D] hover:underline">
              Sign In →
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}
