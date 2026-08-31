import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'

const DEMO_ORDERS = [
  {
    id: 'TS-20260829-4821',
    created_at: '2026-08-29T14:30:00Z',
    status: 'shipped',
    seller_name: 'TechAudio Manufacturing Ltd',
    total_amount: 50150,
    items_count: 50,
    items: [
      {
        title: '10000mAh PD Fast Charging Power Bank Type-C',
        quantity: 50,
        unit: 'pcs',
        unit_price: 850,
        image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60',
      },
    ],
  },
  {
    id: 'TS-20260821-3109',
    created_at: '2026-08-21T10:15:00Z',
    status: 'delivered',
    seller_name: 'Apex Tape Mills & Packaging',
    total_amount: 11328,
    items_count: 300,
    items: [
      {
        title: 'Heavy Duty 2-inch Packaging Bopp Tape 65m',
        quantity: 300,
        unit: 'rolls',
        unit_price: 32,
        image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60',
      },
    ],
  },
  {
    id: 'TS-20260814-1920',
    created_at: '2026-08-14T18:40:00Z',
    status: 'delivered',
    seller_name: 'SteelMax Fasteners & Bearings',
    total_amount: 28320,
    items_count: 200,
    items: [
      {
        title: 'Industrial Grade 6204-2RS Deep Groove Ball Bearing',
        quantity: 200,
        unit: 'pcs',
        unit_price: 120,
        image_url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60',
      },
    ],
  },
]

export default async function OrdersPage() {
  let orders = DEMO_ORDERS

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: dbOrders } = await supabase
        .from('orders')
        .select(`
          id, status, created_at, total_amount, currency,
          seller:company_profiles!seller_id ( display_name, legal_name ),
          order_items ( id, quantity, unit_price, subtotal, products ( title, images, unit ) )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (dbOrders && dbOrders.length > 0) {
        orders = dbOrders.map((o: any) => ({
          id: o.id,
          created_at: o.created_at,
          status: o.status,
          seller_name: o.seller?.display_name || o.seller?.legal_name || 'Verified Supplier',
          total_amount: o.total_amount || 0,
          items_count: o.order_items?.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0) || 0,
          items: (o.order_items || []).map((it: any) => ({
            title: it.products?.title || 'Wholesale Item',
            quantity: it.quantity,
            unit: it.products?.unit || 'pcs',
            unit_price: it.unit_price,
            image_url: it.products?.images?.[0] || DEMO_ORDERS[0].items[0].image_url,
          })),
        }))
      }
    }
  } catch (err) {
    console.error('Fetch orders error:', err)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Delivered
          </span>
        )
      case 'shipped':
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span> In Transit
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Processing Dispatch
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        <div className="flex justify-between items-baseline">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              My Wholesale Orders
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track active dispatches, view e-Way bills, and reorder past batches.
            </p>
          </div>
          <Link href="/products" className="text-xs font-bold text-[#B5924D] hover:underline">
            + New Sourcing Order
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0F172A] text-white">
            All Orders ({orders.length})
          </button>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            In Transit (1)
          </button>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            Delivered ({Math.max(0, orders.length - 1)})
          </button>
        </div>

        {/* Orders List */}
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-slate-50 dark:bg-slate-850 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Order ID
                    </span>
                    <span className="font-mono text-xs font-bold text-[#0F172A] dark:text-white">
                      #{order.id}
                    </span>
                  </div>
                  <div className="hidden sm:block border-l border-slate-200 dark:border-slate-700 pl-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Supplier
                    </span>
                    <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                      {order.seller_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="font-mono text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white">
                    ₹{order.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Items in Order */}
              <div className="p-4 sm:p-5 divide-y divide-slate-100 dark:divide-slate-800">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                        <img src={item.image_url} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {item.quantity} {item.unit} @ ₹{item.unit_price} / {item.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Actions Footer */}
              <div className="bg-slate-50/50 dark:bg-slate-850/50 p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                    <span>Track Dispatch</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <StitchBottomNav />
    </div>
  )
}
