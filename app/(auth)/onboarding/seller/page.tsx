'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

export default function SellerOnboardingPage() {
  const router = useRouter()
  const [factoryName, setFactoryName] = useState('TechAudio Manufacturing Ltd')
  const [gstin, setGstin] = useState('27AABCT9981F1Z2')
  const [factoryLocation, setFactoryLocation] = useState('Chakan MIDC Industrial Corridor, Pune, MH')
  const [productionCapacity, setProductionCapacity] = useState('2,50,000 Units / Month')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Manufacturer KYC & Direct Rail Settlement Verified!')
      router.push('/seller')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold text-[#B5924D] uppercase tracking-wider">
              Step 1 of 2: Factory KYC & Compliance
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
            Manufacturer Onboarding
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast wholesale batches directly to verified Indian retail buyers and corporate buyers.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manufacturing / Mill Name</label>
            <input
              type="text"
              required
              value={factoryName}
              onChange={(e) => setFactoryName(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Factory GSTIN</label>
            <input
              type="text"
              required
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              className="w-full text-xs font-mono font-bold uppercase px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monthly Production Output Capacity</label>
            <input
              type="text"
              required
              value={productionCapacity}
              onChange={(e) => setProductionCapacity(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Factory Floor / Dispatch Unit Address</label>
            <textarea
              rows={2}
              required
              value={factoryLocation}
              onChange={(e) => setFactoryLocation(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 bg-[#0F172A] hover:bg-[#B5924D] text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Registering Factory...' : 'Save & Open Seller Console'}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </form>
      </div>
    </div>
  )
}
