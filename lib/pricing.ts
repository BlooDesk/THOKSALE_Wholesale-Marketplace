// =====================================================================
// ThokSale - Dynamic Quantity Pricing Engine
// Isomorphic (client + server). Single source of truth.
// =====================================================================

export type Tier = {
  id: 1 | 2 | 3
  label: 'Tier 1' | 'Tier 2' | 'Tier 3'
  minQty: number
  maxQty: number | null   // null = unlimited
  multiplier: number
  rangeLabel: string
}

export const PRICING_TIERS: Tier[] = [
  { id: 1, label: 'Tier 1', minQty: 1,   maxQty: 50,   multiplier: 1.12, rangeLabel: '1–50 units' },
  { id: 2, label: 'Tier 2', minQty: 51,  maxQty: 200,  multiplier: 1.08, rangeLabel: '51–200 units' },
  { id: 3, label: 'Tier 3', minQty: 201, maxQty: null, multiplier: 1.05, rangeLabel: '201+ units' },
]

/**
 * Currency-safe rounding (2 dp).
 */
export function money(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Get the tier that applies to a given quantity.
 * Quantities below 1 fall back to Tier 1.
 */
export function tierForQuantity(qty: number): Tier {
  const q = Math.max(1, Math.floor(qty || 1))
  for (const t of PRICING_TIERS) {
    if (q >= t.minQty && (t.maxQty === null || q <= t.maxQty)) return t
  }
  return PRICING_TIERS[0]
}

/**
 * Compute the per-unit price for a given base price + quantity.
 */
export function unitPriceAtQty(basePrice: number, qty: number): number {
  const t = tierForQuantity(qty)
  return money(basePrice * t.multiplier)
}

export type PriceQuote = {
  quantity: number
  basePrice: number
  tier: Tier
  unitPrice: number
  total: number
  /**
   * Savings per unit vs the highest-priced tier (Tier 1).
   * Zero when already on Tier 1.
   */
  perUnitSavingsVsTier1: number
  /**
   * Total savings vs Tier 1 for this quantity.
   */
  totalSavingsVsTier1: number
  /**
   * How many more units are needed to reach the next tier (null if already at last tier).
   */
  nextTier: Tier | null
  unitsToNextTier: number | null
  currency: string
}

/**
 * Full price quote for UI display.
 */
export function computePrice(
  basePrice: number,
  quantity: number,
  currency: string = 'INR'
): PriceQuote {
  const qty = Math.max(1, Math.floor(quantity || 1))
  const tier = tierForQuantity(qty)
  const unitPrice = unitPriceAtQty(basePrice, qty)
  const total = money(unitPrice * qty)

  const tier1Unit = money(basePrice * PRICING_TIERS[0].multiplier)
  const perUnitSavings = money(tier1Unit - unitPrice)
  const totalSavings = money(perUnitSavings * qty)

  const nextIdx = PRICING_TIERS.findIndex((t) => t.id === tier.id) + 1
  const nextTier = nextIdx < PRICING_TIERS.length ? PRICING_TIERS[nextIdx] : null
  const unitsToNextTier = nextTier ? Math.max(0, nextTier.minQty - qty) : null

  return {
    quantity: qty,
    basePrice,
    tier,
    unitPrice,
    total,
    perUnitSavingsVsTier1: perUnitSavings,
    totalSavingsVsTier1: totalSavings,
    nextTier,
    unitsToNextTier,
    currency,
  }
}

/**
 * The pricing table displayed in the UI (row per tier with per-unit price).
 */
export function buildPricingTable(basePrice: number, currency: string = 'INR') {
  return PRICING_TIERS.map((t) => ({
    tier: t,
    unitPrice: money(basePrice * t.multiplier),
    currency,
  }))
}

/**
 * Format money for display. Locale-safe.
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export type ValidationOk = {
  ok: true
  quote: PriceQuote
  message?: never
  code?: never
}
export type ValidationFail = {
  ok: false
  code: 'below-moq' | 'above-stock' | 'invalid-qty' | 'inactive'
  message: string
  quote?: never
}

/**
 * Validate a quantity against product constraints.
 * Isomorphic — safe to call from client OR server.
 */
export function validateQuantity(
  quantity: number,
  opts: {
    basePrice: number
    moq: number
    stock: number
    currency?: string
    status?: string
  }
): ValidationOk | ValidationFail {
  if (opts.status && opts.status !== 'active') {
    return { ok: false, code: 'inactive', message: 'This product is not available for purchase.' }
  }
  const q = Math.floor(quantity)
  if (!Number.isFinite(q) || q <= 0) {
    return { ok: false, code: 'invalid-qty', message: 'Please enter a valid quantity.' }
  }
  if (q < opts.moq) {
    return { ok: false, code: 'below-moq', message: `Minimum order quantity is ${opts.moq}.` }
  }
  if (q > opts.stock) {
    return { ok: false, code: 'above-stock', message: `Only ${opts.stock} in stock.` }
  }
  return { ok: true, quote: computePrice(opts.basePrice, q, opts.currency || 'INR') }
}
