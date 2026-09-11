'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updatePassword } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { AuthShell, AuthHeading } from '@/components/auth/auth-shell'
import { PasswordInput } from '@/components/auth/password-input'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pending, start] = useTransition()
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

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
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    start(async () => {
      const res = await updatePassword(password)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success('Password updated successfully! Please sign in.')
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    })
  }

  const passwordMatch = confirm.length > 0 && password === confirm

  return (
    <AuthShell>
      <AuthHeading
        title="Set New Password"
        subtitle="Create a secure password for your trade account."
      />

      {hasSession === false && (
        <div className="mb-5 p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30 text-sm text-amber-800 dark:text-amber-200 flex items-start gap-3">
          <span className="material-symbols-outlined text-[18px] text-amber-600 flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
            warning
          </span>
          <div>
            <p className="font-bold text-xs">Reset link expired</p>
            <p className="text-xs mt-0.5">
              Please{' '}
              <Link href="/forgot-password" className="font-bold underline text-amber-700 dark:text-amber-300">
                request a new one
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            New Password <span className="text-rose-500">*</span>
          </label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            showStrength
            autoComplete="new-password"
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            {confirm.length > 0 && (
              <span className={`text-[10px] font-bold flex items-center gap-1 ${passwordMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {passwordMatch ? 'check_circle' : 'cancel'}
                </span>
                {passwordMatch ? 'Matches' : 'No match'}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              lock
            </span>
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your new password"
              className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm font-medium bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                confirm.length > 0
                  ? passwordMatch
                    ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20'
                    : 'border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 focus:border-[#B5924D] focus:ring-[#B5924D]/40'
              }`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showConfirm ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending || hasSession === false}
          className="w-full bg-[#0F172A] hover:bg-[#B5924D] text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {pending ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Updating password...</span>
            </>
          ) : (
            <>
              <span>Update Password & Sign In</span>
              <span className="material-symbols-outlined text-[16px]">lock_reset</span>
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Remember your password?{' '}
        <Link href="/login" className="font-bold text-[#B5924D] hover:underline">
          Back to Sign In →
        </Link>
      </p>
    </AuthShell>
  )
}
