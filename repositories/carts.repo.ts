// ============================================================
// THOKSALE — Carts Repository
// Raw Supabase queries for carts & cart_items.
// ============================================================

import { createClient } from '@/lib/supabase/server'

export async function fetchActiveCart(buyerId: string) {
  const supabase = await createClient()
  return supabase
    .from('carts')
    .select(`
      id, buyer_id, seller_id, currency, notes, partner_code_id,
      cart_items (
        id, quantity, unit_price, discount, subtotal,
        products (
          id, name, slug, base_price, factory_gate_price, moq, unit,
          stock_quantity, status,
          product_media ( public_url_or_reference, is_primary )
        )
      ),
      partner_codes ( id, code, discount_type, discount_value )
    `)
    .eq('buyer_id', buyerId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle()
}

export async function fetchCartItemCount(buyerId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('carts')
    .select('id, cart_items(id)')
    .eq('buyer_id', buyerId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle()

  if (!data) return 0
  return (data as any).cart_items?.length ?? 0
}
