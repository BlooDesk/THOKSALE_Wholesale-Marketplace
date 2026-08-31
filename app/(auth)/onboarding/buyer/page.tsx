'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

export default function BuyerOnboardingPage() {
  const router = useRouter()
  const [legalName, setLegalName] = useState('Apex Electrical Traders')
  const [gstin, setGstin] = useState('27AABCA1234F1Z5')
  const [businessType, setBusinessType] = useState('Private Limited / Wholesaler')
  const [address, setAddress] = useState('Unit 402, Trade Square Logistics Park, Hinjewadi Phase 1, Pune - 411057')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('KYC Profile & Business Identity Verified!')
      router.push('/products')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold text-[#B5924D] uppercase tracking-wider">
              Step 1 of 2: Business Verification
            </span>
            <span className="text-slate-400 font-semibold">50% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#B5924D] rounded-full w-1/2"></div>
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Wholesale Buyer Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add your GSTIN to unlock 100% Input Tax Credit and direct factory slab rates.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registered Entity Name</label>
            <input
              type="text"
              required
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registered GSTIN</label>
            <input
              type="text"
              required
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              className="w-full text-xs font-mono font-bold uppercase px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Business Constitution</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            >
              <option value="Private Limited / Wholesaler">Private Limited / Wholesaler</option>
              <option value="Partnership / Regional Dealer">Partnership / Regional Dealer</option>
              <option value="Proprietorship / Retailer">Proprietorship / Retailer</option>
              <option value="Public Limited / Corporate">Public Limited / Corporate</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Delivery Warehouse Address</label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 bg-[#0F172A] hover:bg-[#B5924D] text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Verifying Credentials...' : 'Save & Enter Wholesale Marketplace'}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </form>
      </div>
    </div>
  )
}
