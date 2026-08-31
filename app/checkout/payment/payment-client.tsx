'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

export function PaymentClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || 'ORD-94821'
  const amount = parseFloat(searchParams.get('amount') || '50150')
  const [method, setMethod] = useState<'rtgs' | 'upi' | 'netbanking' | 'credit'>('rtgs')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePay = async () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      toast.success('Wholesale Escrow Payment confirmed! Receipt generated.')
      router.push(`/orders/${orderId}/confirmation?amount=${amount}`)
    }, 1200)
  }

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
      {/* Escrow Guarantee Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 flex items-start gap-3.5">
        <span
          className="material-symbols-outlined text-emerald-600 text-2xl mt-0.5 flex-shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          verified_user
        </span>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300">
            100% Secure Trade Escrow Protection
          </h3>
          <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5 leading-relaxed">
            Your payment is held in a SEBI/RBI compliant nodal escrow account. Funds are released to the supplier only after you verify goods upon delivery.
          </p>
        </div>
      </div>

      {/* Order Amount Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Escrow Settlement Amount
          </span>
          <span className="text-xs text-slate-500 font-semibold">Order #{orderId}</span>
        </div>
        <div className="text-right">
          <span className="font-mono text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white">
            ₹{amount.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 block">Includes 18% GST</span>
        </div>
      </div>

      {/* Payment Rails Options */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Select Settlement Method
        </h2>

        {/* 1. RTGS / NEFT (Direct Escrow VA) */}
        <div
          onClick={() => setMethod('rtgs')}
          className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
            method === 'rtgs'
              ? 'border-[#B5924D] bg-[#B5924D]/5'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[#B5924D] text-xl mt-0.5">account_balance</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                Instant Corporate RTGS / NEFT / IMPS
              </span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Recommended</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Zero transaction fee • Dedicated Escrow Virtual Account (HDFC/ICICI)
            </p>
            {method === 'rtgs' && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl text-[11px] font-mono space-y-1 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Beneficiary:</span>
                  <span className="font-bold">THOKSALE ESCROW TRUST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Virtual A/C:</span>
                  <span className="font-bold text-[#B5924D]">THOK{orderId.replace(/\D/g, '') || '94821'}9001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">IFSC Code:</span>
                  <span className="font-bold">HDFC0000240</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Corporate UPI */}
        <div
          onClick={() => setMethod('upi')}
          className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
            method === 'upi'
              ? 'border-[#B5924D] bg-[#B5924D]/5'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[#B5924D] text-xl mt-0.5">qr_code_scanner</span>
          <div className="flex-1">
            <span className="text-xs font-bold text-[#0F172A] dark:text-white">
              UPI (GPay / PhonePe / BHIM Corporate)
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">Instant settlement up to ₹1,00,000</p>
          </div>
        </div>

        {/* 3. Net Banking */}
        <div
          onClick={() => setMethod('netbanking')}
          className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
            method === 'netbanking'
              ? 'border-[#B5924D] bg-[#B5924D]/5'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[#B5924D] text-xl mt-0.5">payments</span>
          <div className="flex-1">
            <span className="text-xs font-bold text-[#0F172A] dark:text-white">Corporate Net Banking</span>
            <p className="text-[11px] text-slate-500 mt-0.5">50+ Indian commercial & public sector banks</p>
          </div>
        </div>

        {/* 4. Trade Credit Line / PayLater */}
        <div
          onClick={() => setMethod('credit')}
          className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
            method === 'credit'
              ? 'border-[#B5924D] bg-[#B5924D]/5'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[#B5924D] text-xl mt-0.5">credit_score</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                ThokSale Trade Credit (30 Days @ 0%)
              </span>
              <span className="text-[10px] font-bold text-amber-600">Available Limit: ₹5,00,000</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Instant invoice discounting & 30-day payment cycle</p>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handlePay}
        disabled={isProcessing}
        className="w-full bg-[#B5924D] hover:bg-[#96773a] text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[18px]">lock</span>
        <span>
          {isProcessing
            ? 'Confirming Escrow Deposit...'
            : `Confirm & Deposit ₹${amount.toLocaleString('en-IN')}`}
        </span>
      </button>

      <p className="text-center text-[11px] text-slate-400">
        By continuing, you agree to THOKSALE Escrow Terms and Settlement Guidelines.
      </p>
    </main>
  )
}
