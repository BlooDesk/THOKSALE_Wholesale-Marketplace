import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StitchSellerNav } from '@/components/seller/stitch-seller-nav'

const DEMO_SELLER_PRODUCTS = [
  {
    id: 'p-1',
    title: '10000mAh PD Fast Charging Power Bank Type-C Dual Output',
    sku: 'PWR-10K-PD-IND',
    base_price: 850,
    min_order_quantity: 50,
    stock_quantity: 4500,
    unit: 'pcs',
    category: 'Consumer Electronics',
    is_active: true,
    images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60'],
    pricing_tiers: [
      { min_quantity: 50, max_quantity: 199, price: 850 },
      { min_quantity: 200, max_quantity: 499, price: 780 },
    ],
  },
  {
    id: 'p-2',
    title: 'Heavy Duty 2-inch Packaging Bopp Tape 65m (48 Micron)',
    sku: 'TAPE-BOPP-65M',
    base_price: 32,
    min_order_quantity: 200,
    stock_quantity: 18000,
    unit: 'rolls',
    category: 'Industrial Packaging',
    is_active: true,
    images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60'],
    pricing_tiers: [
      { min_quantity: 200, max_quantity: 999, price: 32 },
      { min_quantity: 1000, max_quantity: 4999, price: 28 },
    ],
  },
  {
    id: 'p-3',
    title: 'Industrial Grade 6204-2RS Deep Groove Ball Bearing',
    sku: 'BRG-6204-2RS',
    base_price: 120,
    min_order_quantity: 100,
    stock_quantity: 8200,
    unit: 'pcs',
    category: 'Hardware & Bearings',
    is_active: true,
    images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60'],
    pricing_tiers: [
      { min_quantity: 100, max_quantity: 499, price: 120 },
      { min_quantity: 500, max_quantity: 1999, price: 105 },
    ],
  },
]

export default async function SellerProductsPage() {
  let products = DEMO_SELLER_PRODUCTS

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: dbProducts } = await supabase
        .from('products')
        .select('id, title, slug, sku, base_price, min_order_quantity, stock_quantity, unit, images, is_active, category_id, pricing_tiers ( min_quantity, max_quantity, price )')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (dbProducts && dbProducts.length > 0) {
        products = dbProducts.map((p: any) => ({
          id: p.id,
          title: p.title,
          sku: p.sku || 'SKU-FACTORY',
          base_price: p.base_price,
          min_order_quantity: p.min_order_quantity || 10,
          stock_quantity: p.stock_quantity || 0,
          unit: p.unit || 'pcs',
          category: 'Factory Product',
          is_active: p.is_active,
          images: p.images || [DEMO_SELLER_PRODUCTS[0].images[0]],
          pricing_tiers: p.pricing_tiers || [],
        }))
      }
    }
  } catch (err) {
    console.error('Fetch seller products error:', err)
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchSellerNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5924D]">
              Factory Product Catalog
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight mt-0.5">
              Wholesale SKU Management
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Manage live wholesale price slabs, MOQs, and inventory availability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/seller/inventory"
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Manage Inventory
            </Link>
            <Link
              href="/seller/products/new"
              className="px-4 py-2.5 rounded-xl bg-[#B5924D] hover:bg-[#96773a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add New Product</span>
            </Link>
          </div>
        </div>

        {/* Product Cards List */}
        <div className="flex flex-col gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#B5924D] transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                  <img src={p.images?.[0]} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    SKU: {p.sku} • {p.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white line-clamp-1 mt-0.5">
                    {p.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-[#B5924D] bg-[#B5924D]/10 px-2 py-0.5 rounded">
                      Base: ₹{p.base_price} / {p.unit}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">MOQ: {p.min_order_quantity} {p.unit}</span>
                    <span className="text-[11px] text-emerald-600 font-medium">• Stock: {p.stock_quantity} {p.unit}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link
                  href={`/seller/products/${p.id}/edit`}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[#0F172A] dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Edit Slabs</span>
                </Link>
                <Link
                  href={`/products/${p.id}`}
                  className="px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  <span>Buyer View</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
