'use client'

import Image from 'next/image'

/**
 * ThokSaleLogo — Brand component matching the supplied reference images.
 *
 * Emblem:   /brand/thoksale-emblem.png (supplied reference)
 * Wordmark: THOK (Manrope 800, #0F172A) + SALE (Manrope 400, #B5924D)
 * Tagline:  "Direct from Factory & Wholesaler"
 */

interface ThokSaleLogoProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Extra class for the wrapper */
  className?: string
  /** Dark background mode (white THOK text) */
  dark?: boolean
}

const SIZES = {
  sm:  { icon: 36, name: 'text-[16px]', tagline: 'text-[8px]',  gap: 'gap-2'   },
  md:  { icon: 42, name: 'text-[20px]', tagline: 'text-[9px]',  gap: 'gap-2.5' },
  lg:  { icon: 52, name: 'text-[26px]', tagline: 'text-[11px]', gap: 'gap-3'   },
} as const

export function ThokSaleLogo({ size = 'md', className = '', dark = false }: ThokSaleLogoProps) {
  const s = SIZES[size]
  const thokColor = dark ? 'text-white' : 'text-[#0F172A]'

  return (
    <span className={`flex items-center flex-shrink-0 ${s.gap} ${className}`}>
      {/* ── Emblem ── */}
      <Image
        src="/brand/thoksale-emblem.png"
        alt="THOKSALE"
        width={s.icon}
        height={s.icon}
        className="flex-shrink-0 object-contain"
        priority
        unoptimized
      />

      {/* ── Wordmark + Tagline ── */}
      <span className="flex flex-col justify-center leading-none min-w-0">
        <span className={`${s.name} tracking-tight leading-none`}>
          <span className={`font-extrabold ${thokColor}`}>THOK</span>
          <span className="font-normal text-[#B5924D]">SALE</span>
        </span>
        <span className={`${s.tagline} font-medium tracking-wider text-[#B5924D]/80 mt-1 whitespace-nowrap uppercase`}>
          Direct from Factory &amp; Wholesaler
        </span>
      </span>
    </span>
  )
}
