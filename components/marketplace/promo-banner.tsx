'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck, Award, TrendingUp } from 'lucide-react'

export function PromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6 sm:p-10 text-white shadow-xl border border-zinc-200/10">
      {/* Absolute decorative glow */}
      <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-[#B5924D]/10 blur-[80px] pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 h-[150px] w-[150px] rounded-full bg-[#B5924D]/5 blur-[50px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B5924D]/20 border border-[#B5924D]/40 text-[10px] font-bold text-[#e1bc73] uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5" /> Direct factory settlement
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Consolidate Your Procurement <span className="text-[#B5924D]">Directly From Source</span>
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-medium">
            Skip middle agents entirely. Establish continuous supply lines with first-party certified factories in India, fully covered by ThokSale secure trade escrow.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <span>Full Trade Protection</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Award className="h-4.5 w-4.5 text-[#B5924D] shrink-0" />
              <span>Verified Factories Only</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <Link href="/products" className="w-full md:w-auto">
            <button className="w-full md:w-auto px-8 py-4 rounded-full bg-white text-zinc-950 font-bold text-sm tracking-wide shadow-lg hover:bg-zinc-100 active:scale-98 transition-all flex items-center justify-center gap-2 group">
              Explore Factories
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
