import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StitchSellerNav } from '@/components/seller/stitch-seller-nav'

export default async function SellerDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let sellerProfile: any = null
  if (user) {
    const { data: cp } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('profile_id', user.id)
      .maybeSingle()
    sellerProfile = cp
  }

  const sellerName = sellerProfile?.display_name || sellerProfile?.legal_name || 'TechAudio Manufacturing Ltd'
  const city = sellerProfile?.city || 'Pune'
  const state = sellerProfile?.state || 'Maharashtra'

  const recentOrders = [
    {
      id: 'TS-20260829-4821',
      buyer_name: 'Apex Retailers & Wholesalers Pvt Ltd',
      amount: 50150,
      items_count: '50 units (Power Banks)',
      status: 'shipped',
      date: 'Aug 29, 2026',
    },
    {
      id: 'TS-20260826-1102',
      buyer_name: 'Kolkata Electronic Traders Hub',
      amount: 195000,
      items_count: '250 units (Power Banks)',
      status: 'escrow_held',
      date: 'Aug 26, 2026',
    },
    {
      id: 'TS-20260820-9401',
      buyer_name: 'Surat Hardware & Electricals',
      amount: 78000,
      items_count: '100 units (Power Banks)',
      status: 'delivered',
      date: 'Aug 20, 2026',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchSellerNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Header Profile Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-xl border border-[#B5924D]/30">
              {sellerName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">{sellerName}</h1>
                <span
                  className="material-symbols-outlined text-emerald-600 text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  title="Verified Manufacturer"
                >
                  verified
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                Factory Console • {city}, {state}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/seller/store/techaudio"
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>View Public Storefront</span>
            </Link>
            <Link
              href="/seller/products/new"
              className="px-4 py-2 rounded-xl bg-[#B5924D] hover:bg-[#96773a] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Financial & Operational KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
              Escrow Receivable
            </span>
            <span className="font-mono text-lg sm:text-xl font-black text-[#0F172A] dark:text-white mt-1 block">
              ₹2,45,150
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">3 Dispatches in transit</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
              Dispatches (30D)
            </span>
            <span className="font-mono text-lg sm:text-xl font-black text-[#0F172A] dark:text-white mt-1 block">
              ₹14,80,000
            </span>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">24 Wholesale batches</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
              Active RFQ Quotes
            </span>
            <span className="font-mono text-lg sm:text-xl font-black text-[#B5924D] mt-1 block">
              8 Bids
            </span>
            <span className="text-[10px] text-amber-600 font-bold block mt-0.5">3 Awaiting acceptance</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
              Factory Catalog
            </span>
            <span className="font-mono text-lg sm:text-xl font-black text-[#0F172A] dark:text-white mt-1 block">
              16 SKUs
            </span>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">100% In Stock</span>
          </div>
        </section>

        {/* Quick Management Short-Cuts */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/seller/products"
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#B5924D] transition-colors flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-[#B5924D]">inventory_2</span>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-white">Product Catalog</h3>
              <p className="text-[10px] text-slate-500">Edit slab prices & MOQs</p>
            </div>
          </Link>

          <Link
            href="/seller/inventory"
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#B5924D] transition-colors flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-[#B5924D]">warehouse</span>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-white">Inventory Stock</h3>
              <p className="text-[10px] text-slate-500">Stock updates & batches</p>
            </div>
          </Link>

          <Link
            href="/seller/rfq"
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#B5924D] transition-colors flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-[#B5924D]">request_quote</span>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-white">RFQ Marketplace</h3>
              <p className="text-[10px] text-slate-500">Bid on buyer inquiries</p>
            </div>
          </Link>

          <Link
            href="/seller/orders"
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#B5924D] transition-colors flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-[#B5924D]">local_shipping</span>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-white">Pallet Dispatches</h3>
              <p className="text-[10px] text-slate-500">Generate e-Way bills</p>
            </div>
          </Link>
        </section>

        {/* Recent Wholesale Orders Table */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Incoming Wholesale Dispatches
            </h2>
            <Link href="/seller/orders" className="text-xs font-bold text-[#B5924D] hover:underline">
              View All Orders →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentOrders.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0F172A] dark:text-white">#{o.id}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        o.status === 'delivered'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : o.status === 'shipped'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      }`}
                    >
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{o.buyer_name}</h4>
                  <p className="text-[10px] text-slate-400">
                    {o.items_count} • {o.date}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white block">
                    ₹{o.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Escrow Protected</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
