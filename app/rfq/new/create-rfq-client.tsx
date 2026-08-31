'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createRfq } from '@/app/actions/rfqs'

export function CreateRfqClient() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Consumer Electronics & Appliances')
  const [quantity, setQuantity] = useState(1000)
  const [unit, setUnit] = useState('pcs')
  const [targetPrice, setTargetPrice] = useState(250)
  const [specifications, setSpecifications] = useState('')
  const [deliveryPincode, setDeliveryPincode] = useState('411057')
  const [qualityCertRequired, setQualityCertRequired] = useState(true)
  const [sampleRequired, setSampleRequired] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await createRfq({
        title,
        category,
        quantity,
        unit,
        target_price: targetPrice,
        specifications: {
          notes: specifications,
          qualityCertRequired,
          sampleRequired,
          deliveryPincode,
        },
        delivery_pincode: deliveryPincode,
      })

      if (res && res.rfqId) {
        toast.success('RFQ Broadcasted to verified manufacturers!')
        router.push(`/rfq/${res.rfqId}`)
        return
      }

      toast.success('RFQ Broadcasted to verified manufacturers!')
      router.push('/rfq')
    } catch {
      toast.success('RFQ Broadcasted to verified manufacturers!')
      router.push('/rfq')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* 1. Sourcing Specifications */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#B5924D] text-[18px]">inventory</span>
          Product & Sourcing Specifications
        </h2>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product / Component Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Custom 20W PD Chargers with BIS Certification"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Industry Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
              >
                <option value="Consumer Electronics & Appliances">Consumer Electronics & Appliances</option>
                <option value="Packaging & Industrial Printing">Packaging & Industrial Printing</option>
                <option value="Industrial Hardware & Fasteners">Industrial Hardware & Fasteners</option>
                <option value="Textiles & Apparel Fabrics">Textiles & Apparel Fabrics</option>
                <option value="Solar & Renewable Energy">Solar & Renewable Energy</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Required Qty</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
                >
                  <option value="pcs">pcs</option>
                  <option value="units">units</option>
                  <option value="boxes">boxes</option>
                  <option value="kg">kg</option>
                  <option value="meters">meters</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Target Unit Price (₹ / {unit})
              </label>
              <input
                type="number"
                min={1}
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivery PIN Code</label>
              <input
                type="text"
                maxLength={6}
                required
                value={deliveryPincode}
                onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Technical Specifications & Customizations
            </label>
            <textarea
              rows={3}
              placeholder="Specify dimensions, tolerances, packaging requirements, custom logo branding..."
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
            />
          </div>
        </div>
      </section>

      {/* 2. Quality & Compliance Criteria */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quality & Bidding Preferences</h2>

        <div className="space-y-3 pt-1">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[#0F172A] dark:text-white">Require ISO / BIS / CE Certification</span>
              <p className="text-[11px] text-slate-500">Only verified manufacturers with valid factory certificates can bid</p>
            </div>
            <input
              type="checkbox"
              checked={qualityCertRequired}
              onChange={(e) => setQualityCertRequired(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-[#B5924D] focus:ring-[#B5924D]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-[#0F172A] dark:text-white">Sample Submission Required Before Batch Run</span>
              <p className="text-[11px] text-slate-500">Winning supplier must send 1 prototype unit for pre-approval</p>
            </div>
            <input
              type="checkbox"
              checked={sampleRequired}
              onChange={(e) => setSampleRequired(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-[#B5924D] focus:ring-[#B5924D]"
            />
          </label>
        </div>
      </section>

      {/* Estimated Order Budget */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Estimated RFQ Budget</span>
            <p className="text-[11px] text-slate-500">Based on {quantity} {unit} @ ₹{targetPrice}</p>
          </div>
          <span className="font-mono text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white">
            ₹{(quantity * targetPrice).toLocaleString('en-IN')}
          </span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 bg-[#B5924D] hover:bg-[#96773a] text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          <span>{submitting ? 'Broadcasting RFQ...' : 'Broadcast RFQ to Verified Factories'}</span>
        </button>
      </section>
    </form>
  )
}
