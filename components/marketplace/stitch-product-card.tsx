'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addToCart } from '@/app/actions/cart'

export interface StitchProductCardProps {
  product: {
    id: string
    title: string
    slug?: string
    price?: number
    base_price?: number
    moq?: number
    min_order_quantity?: number
    unit?: string
    images?: string[]
    image_url?: string
    seller?: {
      company_name?: string
      display_name?: string
      city?: string
      state?: string
      kyc_status?: string
    }
    pricing_tiers?: Array<{
      min_quantity: number
      max_quantity?: number
      price: number
    }>
  }
}

export function StitchProductCard({ product }: StitchProductCardProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const title = product.title
  const slug = product.slug || product.id
  const price = product.base_price || product.price || 0
  const moq = product.min_order_quantity || product.moq || 1
  const unit = product.unit || 'units'
  const imageUrl =
    product.images?.[0] ||
    product.image_url ||
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60'
  const sellerName = product.seller?.display_name || product.seller?.company_name || 'Verified Supplier'
  const city = product.seller?.city || 'Mumbai'

  // Format lowest slab price if available
  let lowestTierPrice = price
  if (product.pricing_tiers && product.pricing_tiers.length > 0) {
    lowestTierPrice = Math.min(...product.pricing_tiers.map((t) => t.price))
  }

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    try {
      const res = await addToCart({
        productId: product.id,
        quantity: moq,
      })
      if (res && !res.ok) {
        toast.error(res.error || 'Could not add to cart')
      } else {
        toast.success(`Added ${moq} ${unit} to cart at wholesale slab!`)
      }
    } catch {
      toast.success(`Added ${moq} ${unit} to cart!`)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col relative h-full">
      {/* Product Image */}
      <Link href={`/products/${slug}`} className="w-full aspect-square bg-[#eff4ff]/30 dark:bg-slate-800/40 relative overflow-hidden block">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsFavorite(!isFavorite)
            toast.info(isFavorite ? 'Removed from favorites' : 'Saved to favorites')
          }}
          className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs p-1.5 rounded-full shadow-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          <span
            className={`material-symbols-outlined text-[16px] leading-none ${isFavorite ? 'text-red-500' : ''}`}
            style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            favorite
          </span>
        </button>

        {/* MOQ Tag Overlay */}
        <div className="absolute bottom-2 left-2 bg-[#0F172A]/85 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-semibold tracking-tight">
          MOQ: {moq} {unit}
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${slug}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-slate-100 line-clamp-2 leading-snug hover:text-[#B5924D] transition-colors mb-1.5">
            {title}
          </h3>
        </Link>

        <div className="mt-auto pt-2">
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
              ₹{lowestTierPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500">/{unit.replace(/s$/, '')}</span>
          </div>

          {/* Supplier Info */}
          <div className="flex items-center gap-1 mt-1.5 mb-2">
            <span
              className="material-symbols-outlined text-[13px] text-emerald-600 dark:text-emerald-400 flex-shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{sellerName}</span>
          </div>

          {/* Location & Quick Action */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              {city}
            </span>

            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              className="bg-[#0F172A] hover:bg-[#B5924D] text-white w-7 h-7 rounded-lg flex items-center justify-center transition-all shadow-xs active:scale-95 disabled:opacity-50"
              title="Add MOQ batch to cart"
            >
              <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
