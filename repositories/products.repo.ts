// ============================================================
// THOKSALE — Catalog Repository
// Raw Supabase queries only. No business logic here.
// Called only by CatalogService — never from UI components.
// ============================================================

import { createClient } from '@/lib/supabase/server'

export type ProductRow = {
  id: string
  name: string
  slug: string
  description?: string
  factory_gate_price?: number
  base_price: number
  moq: number
  unit: string
  stock_quantity: number
  status: string
  supplier_type?: string
  sample_available?: boolean
  oem_available?: boolean
  lead_time_days?: number
  mfg_location_city?: string
  mfg_location_state?: string
  seller_id: string
  category_id?: string
  industry_id?: string
  brand_id?: string
  certifications?: any[]
  hsn_code?: string
  gst_rate?: number
  created_at: string
  updated_at: string
}

export type ProductListFilters = {
  q?: string
  category?: string
  industry?: string
  minPrice?: number
  maxPrice?: number
  moq?: number
  state?: string
  supplierType?: string
  sampleAvailable?: boolean
  oemAvailable?: boolean
  verified?: boolean
  limit?: number
  offset?: number
}

export async function fetchProducts(filters: ProductListFilters = {}) {
  const supabase = await createClient()
  const limit = filters.limit ?? 20
  const offset = filters.offset ?? 0

  let query = supabase
    .from('products')
    .select(`
      id, name, slug, base_price, factory_gate_price, moq, unit,
      stock_quantity, status, supplier_type, mfg_location_city,
      mfg_location_state, sample_available, oem_available, lead_time_days,
      seller_id, category_id, brand_id, gst_rate,
      product_media ( public_url_or_reference, is_primary, media_type ),
      brands ( name ),
      categories ( name, slug ),
      company_profiles!products_seller_id_fkey ( display_name, legal_name, kyc_status )
    `, { count: 'exact' })
    .eq('status', 'active')
    .is('deleted_at', null)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (filters.q) {
    query = query.textSearch('search_vector', filters.q, { type: 'websearch' })
  }
  if (filters.category) {
    query = query.eq('category_id', filters.category)
  }
  if (filters.industry) {
    query = query.eq('industry_id', filters.industry)
  }
  if (filters.minPrice) {
    query = query.gte('base_price', filters.minPrice)
  }
  if (filters.maxPrice) {
    query = query.lte('base_price', filters.maxPrice)
  }
  if (filters.moq) {
    query = query.lte('moq', filters.moq)
  }
  if (filters.state) {
    query = query.eq('mfg_location_state', filters.state)
  }
  if (filters.supplierType) {
    query = query.eq('supplier_type', filters.supplierType)
  }
  if (filters.sampleAvailable) {
    query = query.eq('sample_available', true)
  }
  if (filters.oemAvailable) {
    query = query.eq('oem_available', true)
  }

  return query
}

export async function fetchProductBySlug(slug: string) {
  const supabase = await createClient()
  return supabase
    .from('products')
    .select(`
      *,
      product_media ( * ),
      brands ( id, name, logo_url ),
      categories ( id, name, slug, parent_id ),
      industries ( id, name, slug ),
      product_attributes (
        id, value_text, value_number, value_boolean, value_json,
        attribute_definitions ( id, key, label, attr_type, unit )
      ),
      company_profiles!products_seller_id_fkey (
        id, display_name, legal_name, kyc_status, rating,
        city, state, logo_url, description
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle()
}

export async function fetchFeaturedProducts(limit = 8) {
  const supabase = await createClient()
  return supabase
    .from('products')
    .select(`
      id, name, slug, base_price, factory_gate_price, moq, unit, stock_quantity,
      supplier_type, mfg_location_city, mfg_location_state,
      product_media ( public_url_or_reference, is_primary ),
      brands ( name ),
      company_profiles!products_seller_id_fkey ( display_name, kyc_status )
    `)
    .eq('status', 'active')
    .eq('is_featured', true)
    .is('deleted_at', null)
    .limit(limit)
    .order('created_at', { ascending: false })
}

export async function fetchIndustries() {
  const supabase = await createClient()
  return supabase
    .from('industries')
    .select('id, name, slug, icon_name, description, sort_order')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order')
}

export async function fetchCategories(industryId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('categories')
    .select('id, name, slug, parent_id, industry_id, sort_order')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order')

  if (industryId) {
    query = query.eq('industry_id', industryId)
  }

  return query
}

export async function fetchRelatedProducts(categoryId: string, excludeId: string, limit = 6) {
  const supabase = await createClient()
  return supabase
    .from('products')
    .select(`
      id, name, slug, base_price, factory_gate_price, moq, unit,
      product_media ( public_url_or_reference, is_primary ),
      company_profiles!products_seller_id_fkey ( display_name, kyc_status )
    `)
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .neq('id', excludeId)
    .is('deleted_at', null)
    .limit(limit)
}

export async function fetchSellerProducts(sellerId: string, filters: { status?: string; limit?: number; offset?: number } = {}) {
  const supabase = await createClient()
  const limit = filters.limit ?? 20
  const offset = filters.offset ?? 0

  let query = supabase
    .from('products')
    .select('id, name, slug, status, base_price, moq, unit, stock_quantity, created_at, product_media( public_url_or_reference, is_primary )', { count: 'exact' })
    .eq('seller_id', sellerId)
    .is('deleted_at', null)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  return query
}
