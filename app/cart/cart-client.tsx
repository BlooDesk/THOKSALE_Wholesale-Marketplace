'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateCartItem, removeCartItem, applyCodeToCart, removeCodeFromCart } from '@/app/actions/cart'

export function StitchCartClient({ initialCarts, isGuest }: { initialCarts: any[]; isGuest: boolean }) {
  const router = useRouter()
  const [carts, setCarts] = useState(initialCarts)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)

  const handleQtyChange = async (cartId: string, itemId: string, newQty: number, moq: number) => {
    if (newQty < moq) {
      toast.error(`Minimum order quantity for this item is ${moq}`)
      return
    }

    // Update locally for instant responsive UI
    setCarts((prev) =>
      prev.map((cart) => {
        if (cart.id !== cartId) return cart
        return {
          ...cart,
          cart_items: cart.cart_items.map((it: any) => (it.id === itemId ? { ...it, quantity: newQty } : it)),
        }
      })
    )

    if (!isGuest && !cartId.startsWith('cart-demo')) {
      try {
        await updateCartItem(itemId, newQty)
      } catch (err) {
        console.error('Update item failed:', err)
      }
    }
  }

  const handleRemove = async (cartId: string, itemId: string) => {
    setCarts((prev) =>
      prev
        .map((cart) => {
          if (cart.id !== cartId) return cart
          return {
            ...cart,
            cart_items: cart.cart_items.filter((it: any) => it.id !== itemId),
          }
        })
        .filter((c) => c.cart_items.length > 0)
    )

    toast.success('Item removed from cart')

    if (!isGuest && !cartId.startsWith('cart-demo')) {
      try {
        await removeCartItem(itemId)
      } catch (err) {
        console.error('Remove item failed:', err)
      }
    }
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (couponCode.toUpperCase() === 'FIRSTB2B' || couponCode.toUpperCase() === 'BULK5') {
      setAppliedCoupon(couponCode.toUpperCase())
      setCouponDiscount(2500)
      toast.success(`Coupon ${couponCode.toUpperCase()} applied! ₹2,500 Trade Credit Discount added.`)
    } else {
      toast.error('Invalid wholesale partner code')
    }
  }

  if (carts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 my-8">
        <span className="material-symbols-outlined text-5xl text-slate-400 mb-3">shopping_cart</span>
        <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-1">Your wholesale cart is empty</h3>
        <p className="text-xs text-slate-500 mb-4">
          Browse verified Indian manufacturers to add wholesale batches to your cart.
        </p>
        <Link href="/products" className="inline-block bg-[#0F172A] text-white text-xs font-bold px-5 py-2.5 rounded-xl">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {carts.map((cart) => {
        const seller = cart.seller
        const sellerName = seller?.display_name || seller?.legal_name || 'Verified Supplier'

        // Calculate totals
        let subtotal = 0
        cart.cart_items.forEach((it: any) => {
          const p = it.products
          const tiers = p.pricing_tiers || []
          const matchedTier = tiers.find(
            (t: any) =>
              it.quantity >= t.min_quantity &&
              (t.max_quantity === null || t.max_quantity === undefined || it.quantity <= t.max_quantity)
          )
          const unitPrice = matchedTier ? matchedTier.price : p.base_price || 850
          subtotal += unitPrice * it.quantity
        })

        const gstTax = Math.round(subtotal * 0.18) // 18% standard GST
        const finalTotal = Math.max(0, subtotal + gstTax - couponDiscount)

        return (
          <div key={cart.id} className="flex flex-col gap-4">
            {/* Supplier Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              {/* Supplier Header */}
              <div className="bg-slate-50 dark:bg-slate-850 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-emerald-600 text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">{sellerName}</span>
                  <span className="text-[11px] text-slate-500">
                    • {seller?.city || 'Pune'}, {seller?.state || 'MH'}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Consolidated Dispatch
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cart.cart_items.map((it: any) => {
                  const p = it.products
                  const moq = p.min_order_quantity || 50
                  const unit = p.unit || 'pcs'
                  const tiers = p.pricing_tiers || []
                  const matchedTier = tiers.find(
                    (t: any) =>
                      it.quantity >= t.min_quantity &&
                      (t.max_quantity === null || t.max_quantity === undefined || it.quantity <= t.max_quantity)
                  )
                  const unitPrice = matchedTier ? matchedTier.price : p.base_price || 850
                  const itemTotal = unitPrice * it.quantity
                  const imageUrl =
                    p.images?.[0] ||
                    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60'

                  return (
                    <div key={it.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                        <img src={imageUrl} alt="" className="w-full h-full object-contain" />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${p.slug || p.id}`}>
                          <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white line-clamp-2 hover:text-[#B5924D] transition-colors">
                            {p.title}
                          </h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[11px] font-bold text-[#B5924D] bg-[#B5924D]/10 px-2 py-0.5 rounded">
                            ₹{unitPrice.toLocaleString('en-IN')} / {unit}
                          </span>
                          <span className="text-[11px] text-slate-500">MOQ: {moq} {unit}</span>
                          <span className="text-[11px] text-emerald-600 font-semibold">• Slab Applied</span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => handleQtyChange(cart.id, it.id, it.quantity - 10, moq)}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-bold px-2 min-w-[3ch] text-center">
                            {it.quantity}
                          </span>
                          <button
                            onClick={() => handleQtyChange(cart.id, it.id, it.quantity + 10, moq)}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right min-w-[100px]">
                          <p className="font-mono text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white">
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-slate-400">+ GST</p>
                        </div>

                        <button
                          onClick={() => handleRemove(cart.id, it.id)}
                          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Partner Code / Credit Voucher */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    local_activity
                  </span>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Partner / Referral / Trade Coupon (e.g. FIRSTB2B)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-white focus:outline-none focus:border-[#B5924D]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#0F172A] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Apply
                </button>
              </form>
              {appliedCoupon && (
                <div className="mt-2 flex items-center justify-between text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg">
                  <span>Coupon {appliedCoupon} applied (–₹{couponDiscount.toLocaleString('en-IN')})</span>
                  <button
                    onClick={() => {
                      setAppliedCoupon(null)
                      setCouponDiscount(0)
                    }}
                    className="text-slate-400 hover:text-red-500 font-normal"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Order Pricing Breakdown Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Wholesale Order Breakdown
              </h3>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Goods Subtotal (Excl. Tax)</span>
                <span className="font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Estimated GST (18% Input Credit Eligible)</span>
                <span className="font-mono font-semibold">₹{gstTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                <span>Standard B2B Freight (Direct Rail)</span>
                <span>FREE</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>Trade Partner Discount</span>
                  <span>–₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-[#0F172A] dark:text-white">Total Payable</span>
                  <p className="text-[10px] text-slate-400">Includes GST & Verified Escrow Protection</p>
                </div>
                <span className="font-mono text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2">
                <Link
                  href={`/checkout/${cart.id}`}
                  className="w-full bg-[#B5924D] hover:bg-[#96773a] text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <span>Proceed to Wholesale Checkout</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
