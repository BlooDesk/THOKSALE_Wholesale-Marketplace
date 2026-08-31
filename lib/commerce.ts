// =====================================================================
// ThokSale - Commerce helpers (isomorphic)
// =====================================================================

import { computePrice, money, type PriceQuote } from './pricing'

export type PartnerCode = {
  id: string
  code: string
  seller_id: string
  product_id: string | null
  category_id: string | null
  buyer_id: string | null
  discount_type: 'percentage' | 'flat' | 'fixed_price'
  discount_value: number
  min_order_amount: number | null
  min_quantity: number | null
  max_uses: number | null
  used_count: number
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
  deleted_at?: string | null
}

export type PartnerCodeCheck =
  | { ok: true; code: PartnerCode; error?: never }
  | { ok: false; error: string; code?: never }

/**
 * Verify a partner code is usable by this buyer for this seller.
 */
export function checkCodeUsable(
  code: PartnerCode | null | undefined,
  buyerId: string,
  sellerId: string
): PartnerCodeCheck {
  if (!code) return { ok: false, error: 'Invalid code.' }
  if (code.deleted_at) return { ok: false, error: 'Code no longer available.' }
  if (!code.is_active) return { ok: false, error: 'Code is inactive.' }
  if (code.seller_id !== sellerId) {
    return { ok: false, error: 'This code is not for this seller’s catalog.' }
  }
  const now = new Date()
  if (code.valid_from && new Date(code.valid_from) > now) return { ok: false, error: 'Code not yet valid.' }
  if (code.valid_until && new Date(code.valid_until) < now) return { ok: false, error: 'Code expired.' }
  if (code.max_uses !== null && code.used_count >= code.max_uses) {
    return { ok: false, error: 'Code usage limit reached.' }
  }
  if (code.buyer_id && code.buyer_id !== buyerId) {
    return { ok: false, error: 'Code not applicable to your account.' }
  }
  return { ok: true, code }
}

/**
 * Does this partner code apply to a specific product?
 */
export function codeAppliesToProduct(
  code: PartnerCode,
  product: { id: string; category_id?: string | null }
): boolean {
  if (code.product_id) return code.product_id === product.id
  if (code.category_id) return code.category_id === product.category_id
  return true // seller-wide
}

/**
 * Compute the effective unit price for a partner code.
 */
export function computePartnerPrice(basePrice: number, code: PartnerCode): number {
  if (code.discount_type === 'fixed_price') {
    return money(Math.min(basePrice, code.discount_value))
  }
  if (code.discount_type === 'flat') {
    return money(Math.max(0, basePrice - code.discount_value))
  }
  if (code.discount_type === 'percentage') {
    const pct = Math.max(0, Math.min(100, code.discount_value))
    return money(basePrice * (1 - pct / 100))
  }
  return basePrice
}

export type LineCalculation = {
  unitPrice: number
  subtotal: number
  pricingSource: 'dynamic' | 'partner'
  tierLabel?: string
}

/**
 * Compute the final unit price for a cart/order line, choosing between
 * dynamic volume tiers and partner code (partner code wins if applicable).
 */
export function computeLine(opts: {
  basePrice: number
  quantity: number
  product?: {
    id?: string
    category_id?: string | null
    tier_1_min_qty?: number | null
    tier_1_price?: number | null
    tier_2_min_qty?: number | null
    tier_2_price?: number | null
    tier_3_min_qty?: number | null
    tier_3_price?: number | null
  }
  code?: PartnerCode | null
}): LineCalculation {
  const { basePrice, quantity, product, code } = opts

  // Check if partner code applies
  if (code && product?.id && codeAppliesToProduct(code, { id: product.id, category_id: product.category_id })) {
    const partnerUnit = computePartnerPrice(basePrice, code)
    return {
      unitPrice: partnerUnit,
      subtotal: money(partnerUnit * quantity),
      pricingSource: 'partner',
      tierLabel: `Partner (${code.code})`,
    }
  }

  // Fallback to dynamic tier pricing
  if (product) {
    const quote: PriceQuote = computePrice(basePrice, quantity)
    return {
      unitPrice: quote.unitPrice,
      subtotal: quote.total,
      pricingSource: 'dynamic',
      tierLabel: quote.tier.label,
    }
  }

  return {
    unitPrice: basePrice,
    subtotal: money(basePrice * quantity),
    pricingSource: 'dynamic',
  }
}

export type OrderStatus =
  | 'pending_payment'
  | 'escrow_held'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending Payment',
  escrow_held: 'Escrow Held',
  processing: 'Processing',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  escrow_held: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  in_transit: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  refunded: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
}

export function buyerNextStatuses(current: OrderStatus): OrderStatus[] {
  switch (current) {
    case 'pending_payment':
      return ['cancelled']
    case 'in_transit':
    case 'shipped':
      return ['delivered']
    default:
      return []
  }
}

export function sellerNextStatuses(current: OrderStatus): OrderStatus[] {
  switch (current) {
    case 'pending_payment':
      return ['cancelled']
    case 'escrow_held':
      return ['processing', 'cancelled']
    case 'processing':
      return ['shipped', 'cancelled']
    case 'shipped':
      return ['in_transit', 'delivered']
    case 'in_transit':
      return ['delivered']
    default:
      return []
  }
}


