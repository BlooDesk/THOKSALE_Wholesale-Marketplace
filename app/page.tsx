import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { StitchProductCard } from '@/components/marketplace/stitch-product-card'

const FALLBACK_CATEGORIES = [
  { id: 'cat-1', name: 'Electronics', icon: 'memory', slug: 'electronics' },
  { id: 'cat-2', name: 'FMCG & Food', icon: 'shopping_bag', slug: 'fmcg' },
  { id: 'cat-3', name: 'Machinery & Tools', icon: 'precision_manufacturing', slug: 'machinery' },
  { id: 'cat-4', name: 'Textiles & Apparel', icon: 'checkroom', slug: 'textiles' },
  { id: 'cat-5', name: 'Construction', icon: 'construction', slug: 'construction' },
  { id: 'cat-6', name: 'Packaging & Print', icon: 'package_2', slug: 'packaging' },
  { id: 'cat-7', name: 'Chemicals & Polymers', icon: 'science', slug: 'chemicals' },
  { id: 'cat-8', name: 'Electricals', icon: 'bolt', slug: 'electricals' },
]

const FALLBACK_DEALS = [
  {
    id: 'deal-1',
    title: 'Industrial Grade 50W LED Floodlight IP66',
    price: 340,
    moq: 50,
    unit: 'pcs',
    seller: { display_name: 'Lumina Electricals', city: 'Pune' },
    image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'deal-2',
    title: 'Heavy Duty 2-inch Packaging Bopp Tape 65m',
    price: 32,
    moq: 300,
    unit: 'rolls',
    seller: { display_name: 'Apex Tape Mills', city: 'Surat' },
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'deal-3',
    title: 'High Tensile Hex Head M10 Steel Bolts & Nuts',
    price: 8,
    moq: 1000,
    unit: 'sets',
    seller: { display_name: 'Aarav Fasteners', city: 'Ludhiana' },
    image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'deal-4',
    title: '100% Combed Cotton Single Jersey Fabric 180 GSM',
    price: 240,
    moq: 100,
    unit: 'kg',
    seller: { display_name: 'Tiruppur Spinners', city: 'Tiruppur' },
    image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=60',
  },
]

const FALLBACK_PRODUCTS = [
  {
    id: 'prod-1',
    title: '10000mAh PD Fast Charging Power Bank Dual Output',
    price: 480,
    moq: 50,
    unit: 'pcs',
    seller: { display_name: 'ElectroTech India', city: 'Delhi', kyc_status: 'verified' },
    image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60',
    pricing_tiers: [
      { min_quantity: 50, price: 520 },
      { min_quantity: 200, price: 480 },
      { min_quantity: 500, price: 440 },
    ],
  },
  {
    id: 'prod-2',
    title: 'Precision 6204-2RS Deep Groove Steel Ball Bearings',
    price: 115,
    moq: 100,
    unit: 'pcs',
    seller: { display_name: 'SteelMax Bearings', city: 'Mumbai', kyc_status: 'verified' },
    image_url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60',
    pricing_tiers: [
      { min_quantity: 100, price: 125 },
      { min_quantity: 500, price: 115 },
      { min_quantity: 2000, price: 98 },
    ],
  },
  {
    id: 'prod-3',
    title: 'Corrugated 3-Ply Shipping Carton Boxes 12x10x8 inch',
    price: 18,
    moq: 500,
    unit: 'boxes',
    seller: { display_name: 'EcoPack Industries', city: 'Ahmedabad', kyc_status: 'verified' },
    image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=60',
    pricing_tiers: [
      { min_quantity: 500, price: 20 },
      { min_quantity: 2000, price: 18 },
      { min_quantity: 5000, price: 15 },
    ],
  },
  {
    id: 'prod-4',
    title: 'Commercial SS 304 Food Grade Stainless Steel Sheet 1.2mm',
    price: 310,
    moq: 20,
    unit: 'sheets',
    seller: { display_name: 'Jindal Steel Stockists', city: 'Chennai', kyc_status: 'verified' },
    image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=60',
    pricing_tiers: [
      { min_quantity: 20, price: 330 },
      { min_quantity: 50, price: 310 },
      { min_quantity: 200, price: 285 },
    ],
  },
]

export default async function Home() {
  let categories = FALLBACK_CATEGORIES
  let featuredProducts = FALLBACK_DEALS
  let recommendedProducts = FALLBACK_PRODUCTS
  let manufacturers: any[] = []

  try {
    const supabase = await createClient()
    const [{ data: rawCats }, { data: rawFeatured }, { data: rawLatest }, { data: rawMfrs }] =
      await Promise.all([
        supabase
          .from('categories')
          .select('id, name, slug')
          .limit(8),
        supabase
          .from('products')
          .select(`
            id, name, slug, factory_gate_price, moq, unit,
            product_media ( public_url_or_reference, is_primary ),
            brand:brands ( name )
          `)
          .limit(4),
        supabase
          .from('products')
          .select(`
            id, name, slug, factory_gate_price, moq, unit,
            product_media ( public_url_or_reference, is_primary ),
            brand:brands ( name )
          `)
          .limit(8),
        supabase
          .from('business_accounts')
          .select('id, display_name, legal_name, verification_status')
          .limit(3),
      ])

    if (rawCats && rawCats.length > 0) {
      categories = rawCats.map((c, i) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: FALLBACK_CATEGORIES[i % FALLBACK_CATEGORIES.length].icon,
      }))
    }

    if (rawFeatured && rawFeatured.length > 0) {
      featuredProducts = rawFeatured.map((p, idx) => ({
        id: p.id,
        title: p.name,
        price: p.factory_gate_price || 100,
        moq: p.moq || 10,
        unit: (p.unit || 'units').toLowerCase(),
        seller: { display_name: p.brand?.name || 'Verified Supplier', city: 'India' },
        image_url: p.product_media?.[0]?.public_url_or_reference || FALLBACK_DEALS[idx % FALLBACK_DEALS.length].image_url,
      }))
    }

    if (rawLatest && rawLatest.length > 0) {
      recommendedProducts = rawLatest.map((p, idx) => ({
        id: p.id,
        title: p.name,
        price: p.factory_gate_price || 150,
        moq: p.moq || 50,
        unit: (p.unit || 'pcs').toLowerCase(),
        seller: { display_name: p.brand?.name || 'Verified Supplier', city: 'India', kyc_status: 'verified' },
        image_url: p.product_media?.[0]?.public_url_or_reference || FALLBACK_PRODUCTS[idx % FALLBACK_PRODUCTS.length].image_url,
      }))
    }

    if (rawMfrs && rawMfrs.length > 0) {
      manufacturers = rawMfrs.map((m) => ({
        profile_id: m.id,
        display_name: m.display_name || m.legal_name,
        legal_name: m.legal_name,
        city: 'Pune',
        state: 'MH',
        rating: '4.9',
        kyc_status: 'verified',
      }))
    }
  } catch (err) {
    console.error('Home data load fallback:', err)
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-24 md:pb-16 font-sans">
      <StitchHeader />

      <main className="max-w-7xl mx-auto flex flex-col gap-6 pt-4 px-4 sm:px-6 lg:px-8">
        {/* Quick Actions (RFQ & Sell) */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4">
          <Link
            href="/rfq/new"
            className="flex flex-col justify-center items-start p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-[#B5924D]/30 shadow-xs relative overflow-hidden group hover:border-[#B5924D] hover:shadow-md transition-all"
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#B5924D]/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <span
              className="material-symbols-outlined text-[#B5924D] text-2xl mb-2"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              request_quote
            </span>
            <span className="text-sm font-bold text-[#0F172A] dark:text-white mb-0.5 relative z-10">
              Post Wholesale RFQ
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 relative z-10">
              Get custom slab bids from verified factories
            </span>
          </Link>

          <Link
            href="/seller"
            className="flex flex-col justify-center items-start p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#0F172A] dark:hover:border-slate-600 hover:shadow-md transition-all group"
          >
            <span className="material-symbols-outlined text-[#0F172A] dark:text-white text-2xl mb-2 group-hover:scale-110 transition-transform">
              storefront
            </span>
            <span className="text-sm font-bold text-[#0F172A] dark:text-white mb-0.5">
              Sell on THOKSALE
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              List products & supply bulk pan-India
            </span>
          </Link>
        </section>

        {/* Hero Editorial Banner */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#B5924D]/10 rounded-bl-full -z-0"></div>
          <div className="max-w-xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B5924D]/15 text-[#775a1a] dark:text-[#B5924D] text-[11px] font-bold tracking-wider uppercase mb-3">
              <span className="material-symbols-outlined text-[14px]">verified</span> Direct Settlement Rail
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-tight mb-2">
              Source Wholesale. <br />
              <span className="text-[#B5924D]">Grow Your Business.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              Connect directly with verified Indian manufacturers. Zero brokerage, published wholesale slab MOQs, and integrated logistics.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-1 bg-[#F9F8F4] dark:bg-slate-800 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <span
                  className="material-symbols-outlined text-[15px] text-emerald-600"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200">KYC Verified Suppliers</span>
              </div>
              <div className="flex items-center gap-1 bg-[#F9F8F4] dark:bg-slate-800 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[15px] text-[#0F172A] dark:text-white">inventory_2</span>
                <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200">Slab MOQ Pricing</span>
              </div>
              <div className="flex items-center gap-1 bg-[#F9F8F4] dark:bg-slate-800 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[15px] text-[#0F172A] dark:text-white">local_shipping</span>
                <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200">Pan-India Freight</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] hover:bg-[#B5924D] dark:hover:bg-[#B5924D] dark:hover:text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95"
              >
                Explore Wholesale Catalog
              </Link>
              <Link
                href="/distribution"
                className="text-xs sm:text-sm font-bold text-[#775a1a] dark:text-[#B5924D] hover:underline px-3 py-3"
              >
                Distribution Hub →
              </Link>
            </div>
          </div>
        </section>

        {/* Shop by Industry */}
        <section>
          <div className="flex justify-between items-baseline mb-3">
            <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Shop by Industry
            </h2>
            <Link href="/products" className="text-xs font-bold text-[#B5924D] hover:underline">
              View All Industries →
            </Link>
          </div>

          <div className="overflow-x-auto flex gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar scroll-smooth">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-2 min-w-[85px] sm:min-w-[100px] group flex-shrink-0"
              >
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-center p-3 group-hover:border-[#B5924D] group-hover:scale-105 group-hover:shadow-md transition-all">
                  <span className="material-symbols-outlined text-[30px] text-[#0F172A] dark:text-slate-200 group-hover:text-[#B5924D] transition-colors">
                    {cat.icon}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#0F172A] dark:text-slate-300 text-center line-clamp-1 max-w-[90px]">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Wholesale Deals */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
                Hot Wholesale Deals
              </h2>
              <span className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Limited Slabs
              </span>
            </div>
            <Link href="/products" className="text-xs font-bold text-[#B5924D] hover:underline">
              All Deals →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.map((p) => (
              <StitchProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>

        {/* Verified Manufacturers Spotlight */}
        {manufacturers && manufacturers.length > 0 && (
          <section>
            <div className="flex justify-between items-baseline mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B5924D]">Direct From Factories</span>
                <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
                  Verified Manufacturers
                </h2>
              </div>
              <Link href="/products" className="text-xs font-bold text-[#B5924D] hover:underline">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {manufacturers.map((m) => (
                <div
                  key={m.profile_id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-lg border border-slate-200">
                      {m.display_name?.charAt(0) || 'M'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-white truncate flex items-center gap-1">
                        {m.display_name || m.legal_name}
                        <span
                          className="material-symbols-outlined text-emerald-600 text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        {m.city}, {m.state}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      ★ {m.rating || '4.9'}
                    </span>
                    <Link
                      href={`/products?state=${encodeURIComponent(m.state || '')}`}
                      className="text-xs font-bold text-[#B5924D] hover:underline"
                    >
                      View Catalog →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Products Grid */}
        <section>
          <div className="flex justify-between items-baseline mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#B5924D]">Tailored For You</span>
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
                Recommended Wholesale Products
              </h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-[#B5924D] hover:underline">
              See All →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {recommendedProducts.map((prod) => (
              <StitchProductCard key={prod.id} product={prod as any} />
            ))}
          </div>
        </section>

        {/* Business Opportunities & Distribution */}
        <section className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="max-w-2xl mb-6">
            <span className="inline-block px-2.5 py-1 rounded bg-[#B5924D] text-[#0F172A] text-[10px] font-black uppercase tracking-wider mb-2">
              Growth Hub
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
              Business Opportunities & Dealerships
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Apply for exclusive regional distributorships and dealership networks directly from national manufacturing brands.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span
                className="material-symbols-outlined text-[#B5924D] text-2xl mb-1.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                handshake
              </span>
              <h3 className="text-sm font-bold text-white mb-1">Lumina Electricals — South Region</h3>
              <p className="text-xs text-slate-300 mb-3">
                Commercial lighting brand seeking authorized district distributors. 18-24% margin.
              </p>
              <Link href="/distribution/lumina-electricals" className="text-xs font-bold text-[#B5924D] hover:underline">
                Apply for Dealership →
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <span
                className="material-symbols-outlined text-[#B5924D] text-2xl mb-1.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                store
              </span>
              <h3 className="text-sm font-bold text-white mb-1">Aarav Industrial Tools Franchise</h3>
              <p className="text-xs text-slate-300 mb-3">
                Exclusive retail franchise opportunities for precision pneumatic and hand tools.
              </p>
              <Link href="/distribution" className="text-xs font-bold text-[#B5924D] hover:underline">
                Explore Territories →
              </Link>
            </div>
          </div>
        </section>

        {/* Why Trade on THOKSALE */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white mb-6 text-center">
            Why Trade on THOKSALE?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F8F4] dark:bg-slate-800 flex items-center justify-center mb-3 text-[#0F172A] dark:text-white border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white mb-1">
                Verified Businesses
              </h3>
              <p className="text-[11px] text-slate-500">100% KYC verified buyers and manufacturers.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F8F4] dark:bg-slate-800 flex items-center justify-center mb-3 text-[#0F172A] dark:text-white border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white mb-1">
                Escrow Protection
              </h3>
              <p className="text-[11px] text-slate-500">Funds released to supplier only on confirmed delivery.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F8F4] dark:bg-slate-800 flex items-center justify-center mb-3 text-[#0F172A] dark:text-white border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[24px]">local_shipping</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white mb-1">
                Pan-India Logistics
              </h3>
              <p className="text-[11px] text-slate-500">End-to-end full truckload & LTL freight coverage.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F8F4] dark:bg-slate-800 flex items-center justify-center mb-3 text-[#0F172A] dark:text-white border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white mb-1">
                Dedicated Key Manager
              </h3>
              <p className="text-[11px] text-slate-500">Dedicated desk assistance for high-volume trade.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-[#0F172A] dark:text-white">
              THOK<span className="text-[#B5924D]">SALE</span>
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400">
              Wholesale Marketplace
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-semibold">
            <Link href="/products" className="hover:text-[#0F172A] dark:hover:text-white">
              Catalog
            </Link>
            <Link href="/rfq" className="hover:text-[#0F172A] dark:hover:text-white">
              RFQs
            </Link>
            <Link href="/distribution" className="hover:text-[#0F172A] dark:hover:text-white">
              Distributorships
            </Link>
            <Link href="/seller" className="hover:text-[#0F172A] dark:hover:text-white">
              Sell on ThokSale
            </Link>
            <Link href="/account" className="hover:text-[#0F172A] dark:hover:text-white">
              Account
            </Link>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            © {new Date().getFullYear()} THOKSALE Wholesale Marketplace. All rights reserved. Direct B2B Commerce Rail.
          </p>
        </div>
      </footer>

      <StitchBottomNav />
    </div>
  )
}
