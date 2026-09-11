'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { signUp } from '@/app/actions/auth'
import { AuthShell, OrDivider, AuthHeading } from '@/components/auth/auth-shell'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { PasswordInput } from '@/components/auth/password-input'

type Role = 'buyer' | 'seller'

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

function GstinInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isValid = GSTIN_REGEX.test(value)
  const isDirty = value.length > 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          GSTIN Number <span className="text-rose-500">*</span>
        </label>
        {isDirty && (
          <span className={`text-[10px] font-bold ${isValid ? 'text-emerald-600' : 'text-rose-500'} flex items-center gap-1`}>
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isValid ? 'check_circle' : 'error'}
            </span>
            {isValid ? 'Valid GSTIN' : 'Invalid format'}
          </span>
        )}
      </div>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
          receipt_long
        </span>
        <input
          type="text"
          required
          maxLength={15}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="27AABCA1234F1Z5"
          className={`w-full pl-10 pr-10 py-3 rounded-xl border font-mono font-bold text-sm uppercase tracking-widest bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white placeholder:text-slate-400 placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 transition-all ${
            isDirty
              ? isValid
                ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20'
                : 'border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-700 focus:border-[#B5924D] focus:ring-[#B5924D]/40'
          }`}
        />
        {isDirty && (
          <span
            className={`material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[16px] ${isValid ? 'text-emerald-500' : 'text-rose-400'}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isValid ? 'check_circle' : 'cancel'}
          </span>
        )}
      </div>
      <p className="text-[10px] text-slate-400">Format: State code + PAN + entity + default + check (e.g. 27AABCA1234F1Z5)</p>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('buyer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [pending, start] = useTransition()

  const isSeller = role === 'seller'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await signUp({
        role,
        full_name: fullName,
        email,
        phone,
        password,
        company_name: companyName || undefined,
        gst_number: gstNumber ? gstNumber.toUpperCase() : undefined,
      })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success('Account created! Please check your email to verify.')
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    })
  }

  if (step === 'role') {
    return (
      <AuthShell>
        <AuthHeading
          title="Join THOKSALE"
          subtitle="Select how you'll use the platform to get started."
        />

        {/* Google SSO */}
        <GoogleAuthButton label="Sign up with Google" />

        <OrDivider />

        <div className="space-y-6">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">I am a...</p>

          <div className="grid grid-cols-1 gap-3">
            {/* Buyer */}
            <button
              type="button"
              onClick={() => { setRole('buyer'); setStep('details') }}
              className="group relative p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#B5924D] hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all duration-200 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-center justify-center flex-shrink-0 group-hover:bg-[#B5924D]/10 group-hover:border-[#B5924D]/30 transition-all">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 group-hover:text-[#B5924D] transition-colors text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    shopping_bag
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-[#0F172A] dark:text-white text-sm">Wholesale Buyer</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Retailer, Dealer, Distributor, Bulk Purchaser
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {['Factory Rates', 'Credit Terms', 'RFQ Portal'].map(t => (
                      <span key={t} className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-[#B5924D] transition-colors text-xl mt-1">
                  arrow_forward_ios
                </span>
              </div>
            </button>

            {/* Seller */}
            <button
              type="button"
              onClick={() => { setRole('seller'); setStep('details') }}
              className="group relative p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#B5924D] hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all duration-200 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center flex-shrink-0 group-hover:bg-[#B5924D]/10 group-hover:border-[#B5924D]/30 transition-all">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 group-hover:text-[#B5924D] transition-colors text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    factory
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-[#0F172A] dark:text-white text-sm">Manufacturer / Seller</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Factory, Mill, Trader, Master Importer
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {['Trade Catalogue', 'Order Management', 'Verified Badge'].map(t => (
                      <span key={t} className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-[#B5924D] transition-colors text-xl mt-1">
                  arrow_forward_ios
                </span>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#B5924D] hover:underline">
              Sign In →
            </Link>
          </p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      {/* Back */}
      <button
        type="button"
        onClick={() => setStep('role')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#B5924D] transition-colors mb-5"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Change account type
      </button>

      {/* Role badge */}
      <div className="flex items-center gap-2 mb-5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSeller ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-blue-50 dark:bg-blue-950/40'}`}>
          <span className={`material-symbols-outlined text-[18px] ${isSeller ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {isSeller ? 'factory' : 'shopping_bag'}
          </span>
        </div>
        <div>
          <p className="text-xs font-black text-[#0F172A] dark:text-white">
            {isSeller ? 'Manufacturer / Seller Account' : 'Wholesale Buyer Account'}
          </p>
          <p className="text-[10px] text-slate-400">Complete your registration below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">person</span>
              <input
                type="text"
                required
                value={fullName}
                autoComplete="name"
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40 focus:border-[#B5924D] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">phone</span>
              <input
                type="tel"
                required
                value={phone}
                autoComplete="tel"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40 focus:border-[#B5924D] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Corporate Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">mail</span>
            <input
              type="email"
              required
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@apexretail.in"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40 focus:border-[#B5924D] transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Company / Entity Name <span className="text-rose-500">{isSeller ? '*' : ''}</span>
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">business</span>
            <input
              type="text"
              required={isSeller}
              value={companyName}
              autoComplete="organization"
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Apex Retailers Pvt Ltd"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5924D]/40 focus:border-[#B5924D] transition-all"
            />
          </div>
        </div>

        {isSeller && (
          <GstinInput value={gstNumber} onChange={setGstNumber} />
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Account Password <span className="text-rose-500">*</span>
          </label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            showStrength
            autoComplete="new-password"
            required
          />
        </div>

        {/* Terms */}
        <p className="text-[11px] text-slate-400 leading-relaxed">
          By registering, you agree to THOKSALE's{' '}
          <Link href="/terms" className="text-[#B5924D] hover:underline font-semibold">Terms of Service</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#B5924D] hover:underline font-semibold">Privacy Policy</Link>.
        </p>

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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Complete {isSeller ? 'Seller' : 'Buyer'} Registration</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already registered?{' '}
        <Link href="/login" className="font-bold text-[#B5924D] hover:underline">
          Sign In →
        </Link>
      </p>
    </AuthShell>
  )
}
