'use client'

import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { resendVerification } from '@/app/actions/auth'
import { AuthShell } from '@/components/auth/auth-shell'

function VerifyEmailInner() {
  const params = useSearchParams()
  const email = params.get('email') || ''
  const [pending, start] = useTransition()
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  function resend() {
    if (!email) {
      toast.error('No email on record. Please register again.')
      return
    }
    start(async () => {
      const res = await resendVerification(email)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setSent(true)
      toast.success('Verification email sent!')
      // 60 second cooldown
      let sec = 60
      setCooldown(sec)
      const interval = setInterval(() => {
        sec -= 1
        setCooldown(sec)
        if (sec <= 0) clearInterval(interval)
      }, 1000)
    })
  }

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length))
    : ''

  return (
    <div className="space-y-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              mark_email_read
            </span>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check
            </span>
          </div>
        </div>
      </div>

      {/* Copy */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
          Verify Your Email
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          We've sent an activation link to
        </p>
        {email && (
          <p className="text-sm font-black text-[#0F172A] dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 inline-block">
            {maskedEmail}
          </p>
        )}
        <p className="text-xs text-slate-400">Click the link in the email to activate your trade account.</p>
      </div>

      {/* Steps */}
      <div className="space-y-2.5">
        {[
          { icon: 'inbox', label: 'Open your email inbox' },
          { icon: 'mail_outline', label: 'Look for an email from THOKSALE' },
          { icon: 'link', label: 'Click "Verify my email" in the email' },
          { icon: 'verified_user', label: 'Start trading on THOKSALE' },
        ].map((step, i) => (
          <div key={step.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-7 h-7 rounded-lg bg-[#B5924D]/10 border border-[#B5924D]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-black text-[#B5924D]">{i + 1}</span>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-1">
        <button
          onClick={resend}
          disabled={pending || cooldown > 0}
          className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#B5924D] disabled:opacity-50 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#B5924D] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : sent
            ? 'Resend Again'
            : 'Resend Verification Email'}
        </button>

        <Link
          href="/login"
          className="block w-full text-center py-3 rounded-xl bg-[#0F172A] hover:bg-[#B5924D] text-white text-sm font-bold transition-all shadow-sm hover:shadow-md"
        >
          Proceed to Sign In →
        </Link>
      </div>

      <p className="text-center text-xs text-slate-400">
        Wrong email address?{' '}
        <Link href="/register" className="font-bold text-[#B5924D] hover:underline">
          Register again
        </Link>
      </p>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-[#B5924D] border-t-transparent animate-spin" />
        </div>
      }>
        <VerifyEmailInner />
      </Suspense>
    </AuthShell>
  )
}
