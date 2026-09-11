// ============================================================
// THOKSALE — Stitch Product Card (Flipkart / B2B style)
// Shows: image, MOQ badge, tier slab chip, verified badge,
//        seller city, price with "from" label.
// ============================================================

import Link from 'next/link'
import { getPrimaryImageUrl, getDisplayPrice } from '@/services/catalog.service'

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
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toLocaleString('en-IN')}`
}

function Slab({ moq, unit }: { moq: number; unit?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
      <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
      MOQ {moq.toLocaleString('en-IN')} {unit ?? 'pcs'}
    </span>
  )
}

export function StitchProductCard({ product }: { product: Product }) {
  const name = product.name ?? product.title ?? 'Product'
  const price = getDisplayPrice(product) || product.price || 0
  const moq = product.moq ?? 1
  const unit = product.unit ?? 'pcs'
  const slug = product.slug ?? product.id

  // Seller info — support both nested shapes
  const seller = product.seller ?? product.company_profiles
  const sellerName = seller?.display_name ?? seller?.legal_name ?? (product.brands as any)?.name ?? 'Verified Supplier'
  const sellerCity = seller?.city ?? product.mfg_location_city ?? product.mfg_location_state ?? 'India'
  const isVerified = seller?.kyc_status === 'verified'

  // Image
  const imageUrl =
    getPrimaryImageUrl(product) !== 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60'
      ? getPrimaryImageUrl(product)
      : product.image_url ?? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60'

  return (
    <Link
      href={slug.startsWith('http') || slug.startsWith('deal') || slug.startsWith('prod') ? '#' : `/products/${slug}`}
      className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#B5924D]/50 transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-800 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Verified badge */}
        {isVerified && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-0.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Verified
            </span>
          </div>
        )}
        {/* Sample badge */}
        {product.sample_available && (
          <div className="absolute top-2 right-2">
            <span className="bg-[#B5924D]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              Sample
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Name */}
        <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">
          {name}
        </p>

        {/* MOQ chip */}
        <Slab moq={moq} unit={unit} />

        {/* Price */}
        <div className="flex items-baseline gap-1 mt-auto pt-1">
          <span className="text-[10px] text-slate-400 font-medium">from</span>
          <span className="text-[15px] font-black text-[#0F172A] dark:text-white tracking-tight">
            {formatPrice(price)}
          </span>
          <span className="text-[10px] text-slate-400">/{unit}</span>
        </div>

        {/* Seller row */}
        <div className="flex items-center gap-1 pt-0.5 border-t border-slate-100 dark:border-slate-800 mt-0.5">
          <span className="material-symbols-outlined text-[11px] text-slate-400">location_on</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex-1">
            {sellerName}
          </span>
          <span className="text-[10px] text-slate-400 flex-shrink-0">{sellerCity}</span>
        </div>
      </div>
    </Link>
  )
}
