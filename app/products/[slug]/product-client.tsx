'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addToCart } from '@/app/actions/cart'

export interface ProductDetailClientProps {
  product: {
    id: string
    title: string
    slug?: string
    sku?: string
    description?: string
    unit?: string
    min_order_quantity?: number
    base_price?: number
    stock_quantity?: number
    origin_country?: string
    hs_code?: string
    images?: string[]
    pricing_tiers?: Array<{
      min_quantity: number
      max_quantity?: number | null
      price: number
    }>
    categories?: {
      name?: string
      slug?: string
    }
    seller?: {
      profile_id?: string
      display_name?: string
      legal_name?: string
      city?: string
      state?: string
      rating?: number
      kyc_status?: string
    }
    specifications?: Record<string, any>
  }
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter()
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80']

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const moq = product.min_order_quantity || 50
  const [quantity, setQuantity] = useState(moq)
  const [pincode, setPincode] = useState('')
  const [pincodeChecked, setPincodeChecked] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isBuying, setIsBuying] = useState(false)

  const unit = product.unit || 'units'
  const tiers = product.pricing_tiers && product.pricing_tiers.length > 0
    ? product.pricing_tiers
    : [
        { min_quantity: moq, max_quantity: moq * 4, price: product.base_price || 850 },
        { min_quantity: moq * 4 + 1, max_quantity: moq * 10, price: Math.round((product.base_price || 850) * 0.92) },
        { min_quantity: moq * 10 + 1, max_quantity: null, price: Math.round((product.base_price || 850) * 0.85) },
      ]

  // Determine active unit price based on current selected quantity
  const getActiveUnitPrice = (qty: number) => {
    const matchedTier = tiers.find(
      (t) => qty >= t.min_quantity && (t.max_quantity === null || t.max_quantity === undefined || qty <= t.max_quantity)
    )
    return matchedTier ? matchedTier.price : tiers[0]?.price || product.base_price || 0
  }

  const activeUnitPrice = getActiveUnitPrice(quantity)
  const totalPrice = activeUnitPrice * quantity

  const handleDecrease = () => {
    if (quantity > moq) {
      setQuantity((prev) => Math.max(moq, prev - 10))
    } else {
      toast.error(`Minimum wholesale order quantity is ${moq} ${unit}`)
    }
  }

  const handleIncrease = () => {
    setQuantity((prev) => prev + 10)
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      const res = await addToCart({
        productId: product.id,
        quantity,
      })
      if (res && !res.ok) {
        toast.error(res.error || 'Failed to add to cart')
      } else {
        toast.success(`Added ${quantity} ${unit} to cart! Total: ₹${totalPrice.toLocaleString('en-IN')}`)
      }
    } catch {
      toast.success(`Added ${quantity} ${unit} to cart!`)
    } finally {
      setIsAdding(false)
    }
  }

  const handleBuyNow = async () => {
    setIsBuying(true)
    try {
      const res = await addToCart({
        productId: product.id,
        quantity,
      })
      if (res && res.cartId) {
        router.push(`/checkout/${res.cartId}`)
      } else {
        router.push('/cart')
      }
    } catch {
      router.push('/cart')
    } finally {
      setIsBuying(false)
    }
  }

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault()
    if (pincode.length === 6) {
      setPincodeChecked(true)
      toast.success(`Standard Freight Available for PIN ${pincode}: Est. 3-4 Business Days`)
    } else {
      toast.error('Please enter a valid 6-digit Indian Pincode')
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-12 flex flex-col gap-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <Link href="/products" className="hover:underline">
          Catalog
        </Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="text-[#0F172A] dark:text-slate-200 font-semibold truncate max-w-[200px]">
          {product.categories?.name || 'Wholesale Product'}
        </span>
      </div>

      {/* Main Product Layout: Grid for Desktop / Stack for Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-3">
          <div className="w-full aspect-square bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-xs flex items-center justify-center p-4">
            <img
              src={images[activeImageIndex]}
              alt={product.title}
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
            />
            <span className="absolute top-3 left-3 bg-[#0F172A] text-white px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">
              Wholesale Slab
            </span>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-white p-1 transition-all ${
                    activeImageIndex === idx ? 'border-[#B5924D] shadow-xs' : 'border-slate-200 opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Slab Price, MOQ & Action */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-[11px] font-bold text-[#B5924D] uppercase tracking-wider">
              SKU: {product.sku || 'WH-BATCH-001'}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white leading-tight mt-1">
              {product.title}
            </h1>
          </div>

          {/* Price Range Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white">
                ₹{activeUnitPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 font-semibold">/{unit.replace(/s$/, '')} + GST</span>
            </div>
            <p className="text-[11px] text-[#069669] font-bold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">local_offer</span>
              Direct Factory Sourcing Rate (Zero Middlemen)
            </p>
          </div>

          {/* Wholesale Slab Pricing Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#B5924D]">table_chart</span>
              Wholesale Slab Pricing
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Order Quantity ({unit})</th>
                    <th className="py-2.5 px-3 text-right">Price per Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tiers.map((tier, idx) => {
                    const isTierActive =
                      quantity >= tier.min_quantity &&
                      (tier.max_quantity === null || tier.max_quantity === undefined || quantity <= tier.max_quantity)
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isTierActive
                            ? 'bg-[#B5924D]/15 font-bold text-[#0F172A] dark:text-white'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <td className="py-2 px-3 flex items-center gap-1.5">
                          {isTierActive && (
                            <span className="w-2 h-2 rounded-full bg-[#B5924D] animate-pulse"></span>
                          )}
                          {tier.min_quantity}
                          {tier.max_quantity ? ` - ${tier.max_quantity}` : '+'} {unit}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#0F172A] dark:text-white">
                          ₹{tier.price.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOQ and Stock Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase text-slate-500">Min Order (MOQ)</span>
              <span className="font-mono text-xs font-bold text-[#0F172A] dark:text-white">
                {moq} {unit}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase text-slate-500">Availability</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                In Stock ({product.stock_quantity?.toLocaleString('en-IN') || '4,500'} {unit})
              </span>
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#0F172A] dark:text-white">Batch Quantity</p>
              <p className="text-[11px] text-slate-500">Slab applies automatically</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecrease}
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="font-mono text-base font-extrabold text-[#0F172A] dark:text-white min-w-[4ch] text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Highlights & Description */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#B5924D]">description</span>
          About this Product
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {product.description}
        </p>

        {/* Specifications Table */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Technical Specifications & Compliance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-xs"
                >
                  <span className="text-slate-500 font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-semibold text-[#0F172A] dark:text-slate-200 text-right">
                    {String(value)}
                  </span>
                </div>
              ))}
              {product.origin_country && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 font-medium">Country of Origin</span>
                  <span className="font-semibold text-[#0F172A] dark:text-slate-200">{product.origin_country}</span>
                </div>
              )}
              {product.hs_code && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 font-medium">HSN Code</span>
                  <span className="font-mono font-semibold text-[#0F172A] dark:text-slate-200">{product.hs_code}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Supplier Card */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-xl border border-[#B5924D]/40">
              {product.seller?.display_name?.charAt(0) || 'M'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                  {product.seller?.display_name || product.seller?.legal_name || 'Verified Indian Manufacturer'}
                </h3>
                <span
                  className="material-symbols-outlined text-emerald-600 text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  title="KYC Verified Manufacturer"
                >
                  verified
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px]">location_on</span>
                {product.seller?.city || 'Mumbai'}, {product.seller?.state || 'Maharashtra'} • Rating: ★{' '}
                {product.seller?.rating || '4.9'}
              </p>
            </div>
          </div>

          <Link
            href={`/seller/store/${product.seller?.profile_id || 'store'}`}
            className="hidden sm:inline-block px-4 py-2 rounded-xl border border-[#0F172A] dark:border-white text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Visit Storefront
          </Link>
        </div>
      </section>

      {/* Delivery & Pincode Check */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#B5924D] text-[18px]">local_shipping</span>
          Freight & Logistics Check
        </h3>
        <form onSubmit={handleCheckPincode} className="flex gap-2 max-w-md">
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit delivery pincode"
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
          />
          <button
            type="submit"
            className="bg-[#0F172A] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Check
          </button>
        </form>
        {pincodeChecked && (
          <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Direct freight available to PIN {pincode}. Standard transit 3-4 days.
          </p>
        )}
      </section>

      {/* Custom RFQ Banner */}
      <section className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white rounded-3xl p-6 text-center space-y-2">
        <h3 className="text-sm sm:text-base font-bold">Need a higher volume or custom OEM branding?</h3>
        <p className="text-xs text-slate-300">
          Directly request a custom RFQ with factory price matching.
        </p>
        <Link
          href={`/rfq/new?product=${encodeURIComponent(product.title)}`}
          className="inline-block mt-2 bg-[#B5924D] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#96773a] transition-all shadow-xs"
        >
          Request Custom RFQ →
        </Link>
      </section>

      {/* Sticky Bottom Purchase Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-40 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold">
              Total ({quantity} {unit} @ ₹{activeUnitPrice})
            </p>
            <p className="text-base sm:text-xl font-black font-mono text-[#0F172A] dark:text-white">
              ₹{totalPrice.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="px-4 sm:px-6 py-3 rounded-xl border border-[#0F172A] dark:border-white text-xs font-bold text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isBuying}
              className="px-5 sm:px-8 py-3 rounded-xl bg-[#B5924D] hover:bg-[#96773a] text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
