'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { requestPasswordReset } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [pending, start] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await requestPasswordReset(email)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setSent(true)
      toast.success('Reset link sent to your email!')
    })
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-mono text-2xl font-black tracking-tighter text-[#0F172A] dark:text-white">
              THOK<span className="text-[#B5924D]">SALE</span>
            </span>
          </Link>
          <h1 className="text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your registered corporate email to receive a password reset link.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                mark_email_read
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Check Your Inbox</h3>
              <p className="text-xs text-slate-500 mt-1">
                We have emailed a reset link to <strong className="text-[#0F172A] dark:text-white">{email}</strong>.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block bg-[#0F172A] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={pending}
              className="w-full mt-2 bg-[#0F172A] hover:bg-[#B5924D] text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{pending ? 'Sending link...' : 'Send Password Reset Link'}</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          Remembered your password?{' '}
          <Link href="/login" className="font-bold text-[#B5924D] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
