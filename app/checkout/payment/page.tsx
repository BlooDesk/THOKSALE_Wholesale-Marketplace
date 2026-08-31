import { Suspense } from 'react'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { PaymentClient } from './payment-client'

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />
      <Suspense fallback={<div className="p-12 text-center text-xs">Loading secure payment gateway...</div>}>
        <PaymentClient />
      </Suspense>
      <StitchBottomNav />
    </div>
  )
}
