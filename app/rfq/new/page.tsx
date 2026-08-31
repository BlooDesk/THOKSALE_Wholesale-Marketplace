import Link from 'next/link'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { CreateRfqClient } from './create-rfq-client'

export default function CreateRfqPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/rfq" className="text-xs font-bold text-slate-500 hover:text-[#0F172A] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>RFQ Workspace</span>
          </Link>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-bold text-[#0F172A] dark:text-white">Post Requirement</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Create Custom Wholesale RFQ
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Receive competitive wholesale bids directly from verified Indian factories within 24 hours.
          </p>
        </div>

        {/* Interactive Form Component */}
        <CreateRfqClient />
      </main>

      <StitchBottomNav />
    </div>
  )
}
