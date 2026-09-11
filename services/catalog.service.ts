// ============================================================
// THOKSALE — Catalog Service
// Business logic layer. Calls repositories. Never called by
// UI directly — pages use hooks/use-products.ts instead.
// ============================================================

import {
  fetchProducts,
  fetchProductBySlug,
  fetchFeaturedProducts,
  fetchIndustries,
  fetchCategories,
  fetchRelatedProducts,
  fetchSellerProducts,
  type ProductListFilters,
} from '@/repositories/products.repo'

// ─── Industries & Categories ────────────────────────────────

export async function getIndustries() {
  const { data, error } = await fetchIndustries()
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getCategories(industryId?: string) {
  const { data, error } = await fetchCategories(industryId)
  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Products ───────────────────────────────────────────────

export async function getProducts(filters: ProductListFilters = {}) {
  const { data, error, count } = await fetchProducts(filters)
  if (error) throw new Error(error.message)
  return { products: data ?? [], total: count ?? 0 }
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await fetchProductBySlug(slug)
  if (error) throw new Error(error.message)
  return data
}

export async function getFeaturedProducts(limit = 8) {
  const { data, error } = await fetchFeaturedProducts(limit)
  if (error) {
    console.error('getFeaturedProducts error:', error.message)
    return []
  }
  return data ?? []
}

export async function getRelatedProducts(categoryId: string, excludeId: string) {
  const { data, error } = await fetchRelatedProducts(categoryId, excludeId)
  if (error) return []
  return data ?? []
}

// ─── Seller's own catalog ───────────────────────────────────

export async function getSellerProducts(sellerId: string, opts?: { status?: string; limit?: number; offset?: number }) {
  const { data, error, count } = await fetchSellerProducts(sellerId, opts ?? {})
  if (error) throw new Error(error.message)
  return { products: data ?? [], total: count ?? 0 }
}

// ─── Helpers ────────────────────────────────────────────────

/** Resolve the primary image URL from product_media or product_images (compat). */
export function getPrimaryImageUrl(
  product: any,
  fallback = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60'
): string {
  const media = product?.product_media ?? product?.product_images ?? []
  const primary = media.find((m: any) => m.is_primary) ?? media[0]
  return primary?.public_url_or_reference ?? primary?.url ?? fallback
}

/** Formatted seller name from nested company_profiles join. */
export function getSellerName(product: any): string {
  const cp = product?.company_profiles
  return cp?.display_name ?? cp?.legal_name ?? 'Verified Supplier'
}

/** Display price: factory_gate_price is authoritative; fall back to base_price. */
export function getDisplayPrice(product: any): number {
  return product?.factory_gate_price ?? product?.base_price ?? 0
}
