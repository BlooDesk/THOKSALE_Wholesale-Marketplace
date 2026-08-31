import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { StitchCartClient } from './cart-client'

export default async function CartsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let activeCarts: any[] = []

  if (user) {
    const { data: carts } = await supabase
      .from('carts')
      .select(`
        id, seller_id, partner_code_id, currency, updated_at,
        partner_code:partner_codes ( id, code, discount_type, discount_value ),
        seller:company_profiles!seller_id ( display_name, legal_name, city, state, logo_url, kyc_status ),
        cart_items (
          id, quantity,
          products ( id, title, slug, sku, base_price, min_order_quantity, stock_quantity, unit, images, pricing_tiers ( min_quantity, max_quantity, price ) )
        )
      `)
      .eq('buyer_id', user.id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })

    activeCarts = (carts || []).filter((c: any) => c.cart_items?.length > 0)
  }

  // If no DB cart or guest user, show demo wholesale cart item so UI can be fully explored
  if (activeCarts.length === 0) {
    activeCarts = [
      {
        id: 'cart-demo-01',
        seller_id: 'seller-demo',
        currency: 'INR',
        seller: {
          display_name: 'TechAudio Manufacturing Ltd',
          city: 'Pune',
          state: 'Maharashtra',
          kyc_status: 'verified',
        },
        cart_items: [
          {
            id: 'ci-1',
            quantity: 50,
            products: {
              id: 'p-1',
              title: '10000mAh PD Fast Charging Power Bank Type-C Dual Output',
              slug: '10000mah-pd-power-bank',
              base_price: 850,
              min_order_quantity: 50,
              stock_quantity: 4500,
              unit: 'pcs',
              images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60'],
              pricing_tiers: [
                { min_quantity: 50, max_quantity: 199, price: 850 },
                { min_quantity: 200, max_quantity: 499, price: 780 },
              ],
            },
          },
        ],
      },
    ]
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Wholesale Shopping Cart
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Direct supplier invoicing • Minimum order quantities enforced
            </p>
          </div>
          <Link href="/products" className="text-xs font-bold text-[#B5924D] hover:underline">
            + Add More Products
          </Link>
        </div>

        {/* Delivery Location Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between mb-4">
          <div className="flex items-start gap-2.5">
            <span
              className="material-symbols-outlined text-[#B5924D] mt-0.5 text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Deliver to Business Address
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                Pune, Maharashtra – 411001 (Warehouse 2)
              </span>
            </div>
          </div>
          <button className="text-xs font-bold text-[#B5924D] hover:underline uppercase tracking-wider">
            Change
          </button>
        </div>

        {/* Interactive Cart Client */}
        <StitchCartClient initialCarts={activeCarts} isGuest={!user} />
      </main>

      <StitchBottomNav />
    </div>
  )
}
