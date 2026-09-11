// ============================================================
// THOKSALE — Order Service
// Business logic layer for orders. Calls orders.repo.ts.
// ============================================================

import {
  fetchOrders,
  fetchOrderById,
  fetchSellerOrderStats,
  fetchBuyerOrderStats,
  type OrderListFilters,
} from '@/repositories/orders.repo'

export async function getOrders(filters: OrderListFilters = {}) {
  const { data, error, count } = await fetchOrders(filters)
  if (error) throw new Error(error.message)
  return { orders: data ?? [], total: count ?? 0 }
}

export async function getOrderById(id: string) {
  const { data, error } = await fetchOrderById(id)
  if (error) throw new Error(error.message)
  return data
}

export async function getSellerOrderStats(sellerId: string) {
  return fetchSellerOrderStats(sellerId)
}

export async function getBuyerOrderStats(buyerId: string) {
  return fetchBuyerOrderStats(buyerId)
}

// ─── Order Status Helpers ───────────────────────────────────

export type OrderStatus =
  | 'pending' | 'accepted' | 'rejected'
  | 'awaiting_freight_quote' | 'freight_quote_sent' | 'freight_approved'
  | 'ready_for_payment' | 'processing'
  | 'shipped' | 'delivered' | 'cancelled'

/** PRD-compliant display label for order status */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending Review',
    accepted: 'Accepted',
    rejected: 'Rejected',
    awaiting_freight_quote: 'Awaiting Freight Quote',
    freight_quote_sent: 'Freight Quoted',
    freight_approved: 'Freight Approved',
    ready_for_payment: 'Ready for Payment',
    processing: 'Processing',
    shipped: 'Dispatched',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    escrow_held: 'Escrow Held',
    quality_window: '48-hr Quality Window',
    completed: 'Completed',
    disputed: 'Disputed',
  }
  return labels[status] ?? status
}

/** Map status to a color variant */
export function getStatusColor(status: string): 'green' | 'blue' | 'yellow' | 'red' | 'gray' {
  if (['delivered', 'completed'].includes(status)) return 'green'
  if (['processing', 'shipped', 'freight_approved', 'ready_for_payment'].includes(status)) return 'blue'
  if (['pending', 'awaiting_freight_quote', 'freight_quote_sent', 'quality_window'].includes(status)) return 'yellow'
  if (['rejected', 'cancelled', 'disputed'].includes(status)) return 'red'
  return 'gray'
}

/** PRD order flow steps for timeline display */
export const ORDER_TIMELINE_STEPS = [
  { key: 'pending',               label: 'Order Placed' },
  { key: 'awaiting_freight_quote',label: 'Logistics Quote' },
  { key: 'freight_approved',      label: 'Freight Approved' },
  { key: 'ready_for_payment',     label: 'Payment Confirmed' },
  { key: 'processing',            label: 'Processing' },
  { key: 'shipped',               label: 'Dispatched' },
  { key: 'delivered',             label: 'Delivered' },
  { key: 'quality_window',        label: '48-hr Quality Check' },
  { key: 'completed',             label: 'Completed' },
] as const
