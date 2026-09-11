// ============================================================
// THOKSALE — Orders Repository
// Raw Supabase queries for orders, order_items, order_status.
// ============================================================

import { createClient } from '@/lib/supabase/server'

export type OrderListFilters = {
  buyerId?: string
  sellerId?: string
  status?: string
  limit?: number
  offset?: number
}

export async function fetchOrders(filters: OrderListFilters = {}) {
  const supabase = await createClient()
  const limit = filters.limit ?? 20
  const offset = filters.offset ?? 0

  let query = supabase
    .from('orders')
    .select(`
      id, order_number, status, payment_status, grand_total, subtotal,
      freight_total, currency, created_at, updated_at,
      buyer_id, seller_id,
      order_items ( id, product_name, quantity, unit_price, subtotal ),
      company_profiles!orders_buyer_company_id_fkey ( display_name, legal_name ),
      freight_quotes ( status, quoted_amount, carrier, transit_days )
    `, { count: 'exact' })
    .is('deleted_at', null)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (filters.buyerId) query = query.eq('buyer_id', filters.buyerId)
  if (filters.sellerId) query = query.eq('seller_id', filters.sellerId)
  if (filters.status) query = query.eq('status', filters.status)

  return query
}

export async function fetchOrderById(id: string) {
  const supabase = await createClient()
  return supabase
    .from('orders')
    .select(`
      *,
      order_items ( *, products ( name, slug, product_media ( public_url_or_reference, is_primary ) ) ),
      freight_quotes ( * ),
      company_profiles!orders_buyer_company_id_fkey ( display_name, legal_name, city, state ),
      company_profiles!orders_seller_company_id_fkey ( display_name, legal_name, city, state )
    `)
    .eq('id', id)
    .maybeSingle()
}

export async function fetchSellerOrderStats(sellerId: string) {
  const supabase = await createClient()
  const [pending, processing, completed, revenue] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('seller_id', sellerId).eq('status', 'pending'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('seller_id', sellerId).in('status', ['processing', 'shipped']),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('seller_id', sellerId).eq('status', 'delivered'),
    supabase.from('orders').select('grand_total').eq('seller_id', sellerId).eq('status', 'delivered'),
  ])
  const totalRevenue = (revenue.data ?? []).reduce((s: number, o: any) => s + (o.grand_total ?? 0), 0)
  return {
    pending: pending.count ?? 0,
    processing: processing.count ?? 0,
    completed: completed.count ?? 0,
    totalRevenue,
  }
}

export async function fetchBuyerOrderStats(buyerId: string) {
  const supabase = await createClient()
  const [total, active, completed] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('buyer_id', buyerId),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('buyer_id', buyerId).in('status', ['pending','processing','shipped']),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('buyer_id', buyerId).eq('status', 'delivered'),
  ])
  return { total: total.count ?? 0, active: active.count ?? 0, completed: completed.count ?? 0 }
}
