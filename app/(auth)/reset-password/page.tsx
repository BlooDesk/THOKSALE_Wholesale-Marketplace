'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updatePassword } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pending, start] = useTransition()
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session))
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }
    start(async () => {
      const res = await updatePassword(password)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success('Password updated! Please sign in.')
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
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
            Set New Password
          </h1>
          <p className="text-xs text-slate-500">
            Create a secure password for your trade account.
          </p>
        </div>

        {hasSession === false && (
          <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-900 dark:text-amber-200">
            Your reset link has expired. Please{' '}
            <Link href="/forgot-password" className="font-bold underline text-[#B5924D]">
              request a new one
            </Link>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>

          <button
            type="submit"
            disabled={pending || hasSession === false}
            className="w-full mt-2 bg-[#0F172A] hover:bg-[#B5924D] text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{pending ? 'Updating password...' : 'Update Password & Sign In'}</span>
            <span className="material-symbols-outlined text-[16px]">lock_reset</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          Remember your password?{' '}
          <Link href="/login" className="font-bold text-[#B5924D] hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
