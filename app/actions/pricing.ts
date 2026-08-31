'use server'

import { createClient } from '@/lib/supabase/server'
import { validateQuantity, computePrice, type PriceQuote } from '@/lib/pricing'

export type QuoteResult =
  | { ok: true; quote: PriceQuote }
  | { ok: false; error: string; code: 'below-moq' | 'above-stock' | 'invalid-qty' | 'inactive' | 'not-found' }

/**
 * Server-authoritative price quote.
 * Fetches the fresh base_price, moq, stock and status from Supabase, then
 * computes the price using the shared pricing helper.
 * Use this before creating carts / orders / RFQs.
 */
export async function quoteProduct(productId: string, quantity: number): Promise<QuoteResult> {
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('id, base_price, moq, stock_quantity, currency, status, deleted_at')
    .eq('id', productId)
    .maybeSingle()

  if (!product || product.deleted_at) {
    return { ok: false, code: 'not-found', error: 'Product not found.' }
  }

  const v = validateQuantity(quantity, {
    basePrice: Number(product.base_price),
    moq: product.moq,
    stock: product.stock_quantity,
    currency: product.currency,
    status: product.status,
  })

  if (!v.ok) return { ok: false, error: v.message, code: v.code }
  return { ok: true, quote: v.quote }
}

/**
 * Lightweight wrapper: given basePrice + qty, return the quote.
 * Useful for previewing / RFQ workflow when the product isn't in DB yet.
 */
export async function priceCalculator(basePrice: number, quantity: number, currency = 'INR'): Promise<PriceQuote> {
  return computePrice(basePrice, quantity, currency)
}
