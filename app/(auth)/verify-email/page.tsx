'use client'

import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { resendVerification } from '@/app/actions/auth'

function VerifyEmailInner() {
  const params = useSearchParams()
  const email = params.get('email') || ''
  const [pending, start] = useTransition()
  const [sent, setSent] = useState(false)

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
    })
  }

  return (
    <div className="text-center space-y-5">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 ring-8 ring-emerald-50 dark:ring-emerald-900/20">
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          mark_email_read
        </span>
      </div>

      <div>
        <h1 className="text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
          Verify Your Corporate Email
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
          We have dispatched an activation link to{' '}
          {email ? <strong className="text-[#0F172A] dark:text-white">{email}</strong> : 'your email'}. Click the link to complete trade authorization.
        </p>
      </div>

      <div className="space-y-2 pt-2">
        <button
          onClick={resend}
          disabled={pending || sent}
          className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white text-xs font-bold py-3 rounded-xl transition-all disabled:opacity-50"
        >
          {sent ? 'Verification Email Resent' : pending ? 'Sending...' : 'Resend Verification Link'}
        </button>

        <Link
          href="/login"
          className="block w-full bg-[#0F172A] hover:bg-[#B5924D] text-white text-xs font-bold py-3 rounded-xl transition-all shadow-xs"
        >
          Proceed to Sign In →
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <span className="font-mono text-2xl font-black tracking-tighter text-[#0F172A] dark:text-white">
              THOK<span className="text-[#B5924D]">SALE</span>
            </span>
          </Link>
        </div>

        <Suspense fallback={<div className="p-4 text-center text-xs">Loading...</div>}>
          <VerifyEmailInner />
        </Suspense>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          Wrong email address?{' '}
          <Link href="/register" className="font-bold text-[#B5924D] hover:underline">
            Register with another email
          </Link>
        </div>
      </div>
    </div>
  )
}
