'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { signUp } from '@/app/actions/auth'

type Role = 'buyer' | 'seller'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('buyer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [pending, start] = useTransition()

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
      toast.success('Account created! Please verify your email.')
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    })
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-mono text-2xl font-black tracking-tighter text-[#0F172A] dark:text-white">
              THOK<span className="text-[#B5924D]">SALE</span>
            </span>
          </Link>
          <h1 className="text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Create Verified Trade Account
          </h1>
          <p className="text-xs text-slate-500">
            Select your trade constitution to start transacting
          </p>
        </div>

        {/* Account Type Selection Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setRole('buyer')}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
              role === 'buyer'
                ? 'border-[#B5924D] bg-[#B5924D]/5 ring-2 ring-[#B5924D]/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[#B5924D] text-2xl mb-2">shopping_bag</span>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-white">Wholesale Buyer</h3>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Retailer / Dealer / Bulk Purchaser</p>
            </div>
          </div>

          <div
            onClick={() => setRole('seller')}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
              role === 'seller'
                ? 'border-[#B5924D] bg-[#B5924D]/5 ring-2 ring-[#B5924D]/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[#B5924D] text-2xl mb-2">factory</span>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-white">Manufacturer / Seller</h3>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Factory / Mill / Master Importer</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Authorized Officer Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Corporate Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@apexretail.in"
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company / Entity Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Apex Retailers Pvt Ltd"
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GSTIN Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="27AABCA1234F1Z5"
                className="w-full text-xs font-mono font-bold uppercase px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full mt-3 bg-[#0F172A] hover:bg-[#B5924D] text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{pending ? 'Registering Account...' : 'Complete Wholesale Registration'}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-[#B5924D] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  )
}
