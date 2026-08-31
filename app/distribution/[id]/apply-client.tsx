'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function DistributionApplyClient({ brandName }: { brandName: string }) {
  const router = useRouter()
  const [district, setDistrict] = useState('Pune Urban & Rural (MH)')
  const [investment, setInvestment] = useState('₹5,00,000 - ₹10,00,000')
  const [experience, setExperience] = useState('5+ Years in Electrical Retail & Wholesale')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      toast.success(`Dealership application submitted to ${brandName}!`)
      router.push('/account/applications')
    }, 1000)
  }

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div>
        <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
          Apply for Authorized Dealership
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Your verified KYC business profile and GSTIN credentials will be attached automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Territory / District</label>
          <input
            type="text"
            required
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Committed Working Capital</label>
          <select
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
          >
            <option value="₹3,50,000 - ₹5,00,000">₹3,50,000 - ₹5,00,000</option>
            <option value="₹5,00,000 - ₹10,00,000">₹5,00,000 - ₹10,00,000</option>
            <option value="₹10,00,000 - ₹25,00,000">₹10,00,000 - ₹25,00,000</option>
            <option value="₹25,00,000+ Super Stockist">₹25,00,000+ Super Stockist</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Existing Trade Network Experience</label>
          <input
            type="text"
            required
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 bg-[#B5924D] hover:bg-[#96773a] text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {submitting ? 'Submitting Application...' : 'Submit Dealership Application →'}
        </button>
      </form>
    </section>
  )
}
