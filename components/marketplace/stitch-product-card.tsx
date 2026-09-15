'use client'

// ============================================================
// THOKSALE — Stitch Product Card — Blinkit-inspired B2B Design
// Image fills top portion; MOQ pill overlay bottom-left;
// ENQUIRE button overlay bottom-right; wishlist heart top-right;
// KYC badge top-left; Price + Name + Supplier below.
// ============================================================

import Link from 'next/link'
import { useState } from 'react'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60'

// Inlined from catalog.service — pure functions, no server deps
function getPrimaryImageUrl(product: any): string {
  const media = product?.product_media ?? product?.product_images ?? []
  const primary = media.find((m: any) => m.is_primary) ?? media[0]
  return primary?.public_url_or_reference ?? primary?.url ?? product?.image_url ?? FALLBACK_IMG
}
function getDisplayPrice(product: any): number {
  return product?.factory_gate_price ?? product?.base_price ?? 0
}

type TierPricing = { min_quantity: number; price: number }

type Product = {
  id: string
  name?: string
  title?: string
  slug?: string
  base_price?: number
  factory_gate_price?: number
  price?: number
  moq?: number
  unit?: string
  supplier_type?: string
  sample_available?: boolean
  oem_available?: boolean
  lead_time_days?: number
  mfg_location_state?: string
  mfg_location_city?: string
  pricing_tiers?: TierPricing[]
  seller?: { display_name?: string; legal_name?: string; city?: string; state?: string; kyc_status?: string }
  company_profiles?: { display_name?: string; legal_name?: string; city?: string; state?: string; kyc_status?: string }
  product_media?: Array<{ public_url_or_reference?: string; url?: string; is_primary?: boolean }>
  product_images?: Array<{ url?: string; is_primary?: boolean }>
  brands?: { name?: string }
  image_url?: string
}

function formatPrice(n: number): string {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`
  if (n >= 1_000)     return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}



export function StitchProductCard({ product }: { product: Product }) {
  const [wished, setWished] = useState(false)

  const name      = product.name ?? product.title ?? 'Product'
  const price     = getDisplayPrice(product) || product.price || 0
  const moq       = product.moq ?? 1
  const unit      = (product.unit ?? 'pcs').toLowerCase()
  const slug      = product.slug ?? product.id

  const seller     = product.seller ?? product.company_profiles
  const sellerName = seller?.display_name ?? seller?.legal_name ?? (product.brands as any)?.name ?? 'Verified Supplier'
  const sellerCity = seller?.city ?? product.mfg_location_city ?? product.mfg_location_state ?? 'India'
  const isVerified = seller?.kyc_status === 'verified'

  const rawUrl   = getPrimaryImageUrl(product)
  const imageUrl = (rawUrl && rawUrl !== FALLBACK_IMG) ? rawUrl : (product.image_url ?? FALLBACK_IMG)

  const productUrl = (slug.startsWith('http') || slug.startsWith('deal') || slug.startsWith('prod'))
    ? '#'
    : `/products/${slug}`

  return (
    <div className="relative bg-[#141923] rounded-[18px] overflow-hidden border border-white/[0.06] flex flex-col group transition-all duration-200 hover:border-[#C4973A]/40 hover:shadow-xl hover:shadow-black/60">

      {/* ── Image + Overlay ─────────────────────── */}
      <Link href={productUrl} className="relative block overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        {/* KYC Verified — top-left */}
        {isVerified && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-0.5 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-[3px] rounded-full uppercase tracking-widest shadow-md">
              <span className="material-symbols-outlined" style={{ fontSize: '9px', fontVariationSettings: "'FILL' 1" }}>verified</span>
              KYC
            </span>
          </div>
        )}

        {/* Sample badge — below KYC */}
        {product.sample_available && (
          <div className="absolute z-10 left-2" style={{ top: isVerified ? '28px' : '8px' }}>
            <span className="inline-flex bg-[#C4973A]/90 text-white text-[8px] font-bold px-1.5 py-[3px] rounded-full">
              Sample ✓
            </span>
          </div>
        )}

        {/* Wishlist — top-right */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWished(w => !w) }}
          className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 transition-all hover:bg-black/70 active:scale-90"
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <span
            className="material-symbols-outlined transition-colors"
            style={{ fontSize: '14px', fontVariationSettings: `'FILL' ${wished ? 1 : 0}`, color: wished ? '#ef4444' : '#ffffff' }}
          >favorite</span>
        </button>

        {/* MOQ pill + Enquire */}
        <div className="absolute bottom-0 inset-x-0 z-10 p-2 flex items-end justify-between gap-1.5">
          <span className="bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-[5px] rounded-lg border border-white/10 leading-none flex-shrink-0">
            MOQ {moq.toLocaleString('en-IN')} {unit}
          </span>
          <span className="bg-[#C4973A] text-white text-[9px] font-black px-2.5 py-[5px] rounded-xl shadow-lg uppercase tracking-wide leading-none flex-shrink-0">
            Enquire
          </span>
        </div>
      </Link>

      {/* ── Card Content ─────────────────────────── */}
      <Link href={productUrl} className="p-2.5 flex flex-col gap-1 flex-1">
        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-[15px] font-black text-white tracking-tight">{formatPrice(price)}</span>
          <span className="text-[10px] text-slate-600">/{unit}</span>
        </div>

        {/* Name */}
        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 font-medium">{name}</p>

        {/* Supplier row */}
        <div className="flex items-center gap-1 mt-auto pt-1.5 border-t border-white/[0.05]">
          <span className="material-symbols-outlined text-slate-600" style={{ fontSize: '10px' }}>location_on</span>
          <span className="text-[10px] text-slate-500 truncate flex-1">{sellerName}</span>
          <span className="text-[10px] text-slate-600 flex-shrink-0 ml-0.5">{sellerCity}</span>
        </div>
      </Link>
    </div>
  )
}
