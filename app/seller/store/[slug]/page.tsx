import Link from 'next/link'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { StitchProductCard } from '@/components/marketplace/stitch-product-card'

export default async function SellerStorefrontPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  const store = {
    name: 'TechAudio Manufacturing Ltd',
    tagline: 'OEM Audio & Power Electronics Manufacturer',
    established: '2016',
    location: 'Chakan MIDC Industrial Corridor, Pune, Maharashtra',
    gstin: '27AABCT9981F1Z2',
    certifications: ['ISO 9001:2015', 'BIS Certified R-84920', 'CE / RoHS Compliant'],
    rating: '4.9',
    orders_fulfilled: '1,420+ Pallets',
    response_time: '< 2 Hours',
    capacity: '2,50,000 Units / Month',
    products: [
      {
        id: 'p-1',
        title: '10000mAh PD Fast Charging Power Bank Type-C Dual Output',
        slug: '10000mah-pd-power-bank',
        base_price: 850,
        min_order_quantity: 50,
        stock_quantity: 4500,
        unit: 'pcs',
        images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60'],
        seller: {
          display_name: 'TechAudio Manufacturing Ltd',
          city: 'Pune',
          state: 'MH',
          kyc_status: 'verified',
        },
        pricing_tiers: [
          { min_quantity: 50, max_quantity: 199, price: 850 },
          { min_quantity: 200, max_quantity: 499, price: 780 },
        ],
      },
      {
        id: 'p-4',
        title: 'ANC Bluetooth 5.3 Over-Ear Studio Headphones (40mm Drivers)',
        slug: 'anc-bluetooth-studio-headphones',
        base_price: 1450,
        min_order_quantity: 25,
        stock_quantity: 2100,
        unit: 'pcs',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'],
        seller: {
          display_name: 'TechAudio Manufacturing Ltd',
          city: 'Pune',
          state: 'MH',
          kyc_status: 'verified',
        },
        pricing_tiers: [
          { min_quantity: 25, max_quantity: 99, price: 1450 },
          { min_quantity: 100, max_quantity: 499, price: 1280 },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/products" className="text-xs font-bold text-slate-500 hover:text-[#0F172A] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>All Manufacturers</span>
          </Link>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-bold text-[#0F172A] dark:text-white">{store.name}</span>
        </div>

        {/* Storefront Hero Banner */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-2xl border border-[#B5924D]/40">
                T
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">{store.name}</h1>
                  <span
                    className="material-symbols-outlined text-emerald-600 text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold">{store.tagline}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {store.location}
                </p>
              </div>
            </div>

            <div className="flex gap-2 self-start">
              <Link
                href="/rfq/new"
                className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#B5924D] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">request_quote</span>
                <span>Request Custom Batch RFQ</span>
              </Link>
            </div>
          </div>

          {/* Key Factory Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Established</span>
              <span className="font-bold text-[#0F172A] dark:text-white">{store.established}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Monthly Capacity</span>
              <span className="font-bold text-[#0F172A] dark:text-white">{store.capacity}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Buyer Rating</span>
              <span className="font-bold text-amber-600">★ {store.rating} ({store.orders_fulfilled})</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Avg. Inquiry Response</span>
              <span className="font-bold text-emerald-600">{store.response_time}</span>
            </div>
          </div>

          {/* Certifications Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Certifications:</span>
            {store.certifications.map((c, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
              >
                ✓ {c}
              </span>
            ))}
          </div>
        </section>

        {/* Factory Catalog Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white">
              Direct Factory Wholesale Catalog ({store.products.length} Products)
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {store.products.map((p) => (
              <StitchProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>

      <StitchBottomNav />
    </div>
  )
}
