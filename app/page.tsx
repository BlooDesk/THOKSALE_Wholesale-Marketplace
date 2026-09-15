import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { StitchProductCard } from '@/components/marketplace/stitch-product-card'
import { DealTimer } from '@/components/marketplace/deal-timer'

export const dynamic = 'force-dynamic'

// --- Types ---
type Industry = { id: string; name: string; slug: string; icon_name?: string }

// --- Fallbacks ---
const FALLBACK_INDUSTRIES: Industry[] = [
  { id: 'i1',  name: 'Agri & Food',               slug: 'agri-food' },
  { id: 'i2',  name: 'FMCG & Personal Care',      slug: 'fmcg-personal-care' },
  { id: 'i3',  name: 'Fashion & Lifestyle',       slug: 'fashion-lifestyle' },
  { id: 'i4',  name: 'Construction & Building',   slug: 'construction-building' },
  { id: 'i5',  name: 'Electronics & Electrical',  slug: 'electronics-electrical' },
  { id: 'i6',  name: 'Automotive & Mobility',     slug: 'automotive-mobility' },
  { id: 'i7',  name: 'Industrial & Engineering',  slug: 'industrial-engineering' },
  { id: 'i8',  name: 'Chemicals & Materials',     slug: 'chemicals-materials' },
  { id: 'i9',  name: 'Healthcare & Wellness',     slug: 'healthcare-wellness' },
  { id: 'i10', name: 'Home & Living',            slug: 'home-living' },
  { id: 'i11', name: 'Consumer & General Goods',  slug: 'consumer-general' },
  { id: 'i12', name: 'Energy & Infrastructure',  slug: 'energy-infrastructure' },
]

const FALLBACK_FEATURED = [
  { id: 'f1', name: 'Industrial Grade 50W LED Floodlight IP66',     base_price: 340, moq: 50,   unit: 'pcs',  seller: { display_name: 'Lumina Electricals',  city: 'Pune',      kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=60' },
  { id: 'f2', name: 'Heavy Duty 2-inch Packaging BOPP Tape 65m',    base_price: 32,  moq: 300,  unit: 'rolls',seller: { display_name: 'Apex Tape Mills',      city: 'Surat',     kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=60' },
  { id: 'f3', name: 'High Tensile Hex Head M10 Steel Bolts & Nuts', base_price: 8,   moq: 1000, unit: 'sets', seller: { display_name: 'Aarav Fasteners',      city: 'Ludhiana',  kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=400&auto=format&fit=crop&q=60' },
  { id: 'f4', name: '100% Combed Cotton Single Jersey 180 GSM',     base_price: 240, moq: 100,  unit: 'kg',   seller: { display_name: 'Tiruppur Spinners',    city: 'Tiruppur',  kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&auto=format&fit=crop&q=60' },
  { id: 'f5', name: 'Corrugated 3-Ply Shipping Carton 12x10x8',    base_price: 18,  moq: 500,  unit: 'pcs',  seller: { display_name: 'EcoPack Industries',   city: 'Ahmedabad', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&auto=format&fit=crop&q=60' },
  { id: 'f6', name: 'Organic Basmati Rice Extra Long Grain Premium', base_price: 82, moq: 200,  unit: 'kg',   seller: { display_name: 'Golden Grain Exports', city: 'Amritsar',  kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=60' },
]

const FALLBACK_LATEST = [
  { id: 'p1', name: '10000mAh PD Fast Charging Power Bank Dual Output',    base_price: 480, moq: 50,   unit: 'pcs',  seller: { display_name: 'ElectroTech India',     city: 'Delhi',   kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&auto=format&fit=crop&q=60', sample_available: true },
  { id: 'p2', name: 'Precision 6204-2RS Deep Groove Ball Bearings',        base_price: 115, moq: 100,  unit: 'pcs',  seller: { display_name: 'SteelMax Bearings',      city: 'Mumbai',  kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&auto=format&fit=crop&q=60', oem_available: true },
  { id: 'p3', name: 'Shea Butter Hand Cream 100ml Wholesale Pack',         base_price: 95,  moq: 60,   unit: 'pcs',  seller: { display_name: 'Pure Botanics',          city: 'Jaipur',  kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&auto=format&fit=crop&q=60', sample_available: true },
  { id: 'p4', name: 'TMT Fe500D Reinforcement Bar 8mm 12m Length',         base_price: 68,  moq: 5000, unit: 'kg',   seller: { display_name: 'JSW Steel Distributors', city: 'Bellary', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&auto=format&fit=crop&q=60' },
  { id: 'p5', name: 'Commercial SS 304 Food Grade Stainless Sheet 1.2mm',  base_price: 310, moq: 20,   unit: 'pcs',  seller: { display_name: 'Jindal Stockists',       city: 'Chennai', kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&auto=format&fit=crop&q=60' },
  { id: 'p6', name: 'Industrial Grade CPVC Plumbing Pipe 1 inch SDR 11',  base_price: 45,  moq: 100,  unit: 'pcs',  seller: { display_name: 'Finolex Pipes',          city: 'Pune',    kyc_status: 'verified' }, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=60' },
]

// --- Static category data ---
const BUSINESS_ESSENTIALS = [
  { name: 'Agri & Food',  slug: '/products?industry=agri-food',             image: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=300&h=300&fit=crop&q=80', bg: '#2d4a1e' },
  { name: 'FMCG & Care',  slug: '/products?industry=fmcg-personal-care',    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop&q=80', bg: '#1e3a5f' },
  { name: 'Fashion',      slug: '/products?industry=fashion-lifestyle',      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop&q=80', bg: '#4a1e3a' },
  { name: 'Electronics',  slug: '/products?industry=electronics-electrical', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop&q=80', bg: '#1e2a5f' },
  { name: 'Construction', slug: '/products?industry=construction-building',  image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&h=300&fit=crop&q=80', bg: '#4a3a1e' },
  { name: 'Industrial',   slug: '/products?industry=industrial-engineering', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop&q=80', bg: '#3a1e1e' },
  { name: 'Automotive',   slug: '/products?industry=automotive-mobility',    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=300&fit=crop&q=80', bg: '#3a3a1e' },
  { name: 'Healthcare',   slug: '/products?industry=healthcare-wellness',    image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=300&h=300&fit=crop&q=80', bg: '#1e3a3a' },
]

const FMCG_SUBCATS = [
  { name: 'Personal Care', slug: '/products?industry=fmcg-personal-care&sub=personal-care', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop&q=80', bg: '#1e3a4a' },
  { name: 'Food & Bev',    slug: '/products?industry=fmcg-personal-care&sub=food-beverages',image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop&q=80', bg: '#3a2a1e' },
  { name: 'Home Care',     slug: '/products?industry=fmcg-personal-care&sub=home-care',     image: 'https://images.unsplash.com/photo-1584824486516-0555a07fc511?w=300&h=300&fit=crop&q=80', bg: '#1e3a2a' },
  { name: 'Baby Care',     slug: '/products?industry=fmcg-personal-care&sub=baby-care',     image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=300&fit=crop&q=80', bg: '#3a1e3a' },
  { name: 'Health OTC',    slug: '/products?industry=healthcare-wellness',                   image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&q=80', bg: '#1e3a2a' },
  { name: 'Snacks',        slug: '/products?industry=fmcg-personal-care&sub=snacks',        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300&h=300&fit=crop&q=80', bg: '#3a3a1e' },
  { name: 'Beverages',     slug: '/products?industry=fmcg-personal-care&sub=beverages',     image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&h=300&fit=crop&q=80', bg: '#1e2a3a' },
  { name: 'Dairy',         slug: '/products?industry=agri-food&sub=dairy',                  image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&q=80', bg: '#1e2a3a' },
]

const AGRI_SUBCATS = [
  { name: 'Food Grains',   slug: '/products?industry=agri-food&sub=grains',     image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop&q=80', bg: '#2a3a1e' },
  { name: 'Spices',        slug: '/products?industry=agri-food&sub=spices',     image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop&q=80', bg: '#3a1e1e' },
  { name: 'Seeds',         slug: '/products?industry=agri-food&sub=seeds',      image: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=300&h=300&fit=crop&q=80', bg: '#1e2a1e' },
  { name: 'Farm Equipment',slug: '/products?industry=agri-food&sub=equipment',  image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=300&fit=crop&q=80', bg: '#2a2e1e' },
  { name: 'Processed Food',slug: '/products?industry=agri-food&sub=processed',  image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300&h=300&fit=crop&q=80', bg: '#3a2a1e' },
  { name: 'Edible Oils',   slug: '/products?industry=agri-food&sub=oils',       image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop&q=80', bg: '#2e1e1e' },
  { name: 'Fertilizers',   slug: '/products?industry=agri-food&sub=fertilizers',image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop&q=80', bg: '#1e2a1e' },
  { name: 'Dry Fruits',    slug: '/products?industry=agri-food&sub=dry-fruits', image: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=300&h=300&fit=crop&q=80', bg: '#2a1e1e' },
]

// Material Symbols icon names — no emoji, no encoding issues
const SUPPLIER_TYPES = [
  { name: 'Factory\nDirect',       icon: 'factory',                 bg: '#1C3A22', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop&q=80', href: '/products?type=manufacturer' },
  { name: 'Brand\nDistributor',    icon: 'business',                bg: '#1A2E4A', image: 'https://images.unsplash.com/photo-1620806497745-9831a29fbcbb?w=300&h=300&fit=crop&q=80', href: '/products?type=distributor' },
  { name: 'Agri\nExporter',        icon: 'agriculture',             bg: '#2E3A1A', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop&q=80', href: '/products?industry=agri-food' },
  { name: 'OEM\nMaker',            icon: 'precision_manufacturing', bg: '#2A1A3F', image: 'https://images.unsplash.com/photo-1565963360316-2ac7d5a3bee5?w=300&h=300&fit=crop&q=80', href: '/products?type=oem' },
  { name: 'Pharma\nWholesale',     icon: 'medication',              bg: '#1A3A3A', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&q=80', href: '/products?industry=healthcare-wellness' },
  { name: 'Textile\nMills',        icon: 'checkroom',               bg: '#3A1A1A', image: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=300&h=300&fit=crop&q=80', href: '/products?industry=fashion-lifestyle' },
  { name: 'Electronics\nWholesale',icon: 'electrical_services',     bg: '#1A1A3F', image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=300&h=300&fit=crop&q=80', href: '/products?industry=electronics-electrical' },
  { name: 'Steel &\nMetals',       icon: 'hardware',                bg: '#2A2A2A', image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=300&h=300&fit=crop&q=80', href: '/products?industry=industrial-engineering' },
]

// Material Symbols icon names for industry tabs
const INDUSTRY_ICONS: Record<string, string> = {
  'agri-food':              'agriculture',
  'fmcg-personal-care':     'local_mall',
  'fashion-lifestyle':      'checkroom',
  'construction-building':  'construction',
  'electronics-electrical': 'bolt',
  'automotive-mobility':    'directions_car',
  'industrial-engineering': 'precision_manufacturing',
  'chemicals-materials':    'science',
  'healthcare-wellness':    'health_and_safety',
  'home-living':            'chair',
  'consumer-general':       'category',
  'energy-infrastructure':  'solar_power',
}

// --- Helper: normalise DB row to card-compatible shape ---
function normalizeProduct(p: any, fallback: any) {
  return {
    id:                 p.id,
    name:               p.name,
    slug:               p.slug,
    base_price:         p.factory_gate_price ?? p.base_price ?? fallback.base_price,
    factory_gate_price: p.factory_gate_price,
    moq:                p.moq ?? fallback.moq,
    unit:               (p.unit ?? fallback.unit ?? 'pcs').toLowerCase(),
    sample_available:   p.sample_available ?? false,
    oem_available:      p.oem_available ?? false,
    mfg_location_city:  p.mfg_location_city,
    mfg_location_state: p.mfg_location_state,
    product_media:      p.product_media ?? [],
    seller: {
      display_name: p.company_profiles?.display_name ?? p.brands?.name ?? fallback.seller?.display_name,
      city:         p.mfg_location_city ?? fallback.seller?.city ?? 'India',
      kyc_status:   p.company_profiles?.kyc_status ?? 'verified',
    },
    image_url: fallback.image_url,
  }
}

function getTodayEnd() {
  const d = new Date()
  d.setHours(23, 59, 59, 0)
  return d
}

// --- Inline sub-components ---

function SectionHeader({
  label, title, href, hrefLabel = 'View All'
}: { label?: string; title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        {label && (
          <span className="text-[10px] uppercase font-black tracking-widest text-[#C4973A] mb-0.5 block">
            {label}
          </span>
        )}
        <h2 className="text-[18px] font-black text-[#0F172A] tracking-tight leading-tight">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-[12px] font-bold text-[#C4973A] hover:underline flex-shrink-0 ml-4">
          {hrefLabel} &rarr;
        </Link>
      )}
    </div>
  )
}

function CategoryTile({ name, image, bg, slug }: { name: string; image: string; bg: string; slug: string }) {
  return (
    <Link href={slug} className="flex flex-col items-center group">
      <div
        className="w-full rounded-xl overflow-hidden relative shadow-sm bg-slate-100"
        style={{ aspectRatio: '1/1', backgroundColor: bg }}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {/* Name label overlaid at bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-4 pb-1.5 px-1">
          <p className="text-[9px] text-white text-center font-bold leading-tight truncate">
            {name}
          </p>
        </div>
      </div>
    </Link>
  )
}

function SupplierTile({ name, icon, bg, image, href }: { name: string; icon: string; bg: string; image: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center group">
      <div
        className="w-full rounded-xl overflow-hidden relative shadow-sm"
        style={{ aspectRatio: '1/1', backgroundColor: bg }}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2">
          <span
            className="material-symbols-outlined text-white transition-colors drop-shadow-md"
            style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
          <p className="text-[10px] text-white text-center font-bold leading-tight px-0.5 whitespace-pre-line drop-shadow-md">
            {name}
          </p>
        </div>
      </div>
    </Link>
  )
}

// --- Main Page ---
export default async function Home() {
  let industries: Industry[] = FALLBACK_INDUSTRIES
  let featuredProducts: any[] = FALLBACK_FEATURED
  let latestProducts: any[]   = FALLBACK_LATEST

  try {
    const supabase = await createClient()

    const [indsRes, featuredRes, latestRes] = await Promise.allSettled([
      supabase
        .from('industries')
        .select('id, name, slug, icon_name')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('sort_order')
        .limit(12),

      supabase
        .from('products')
        .select(`
          id, name, slug, base_price, factory_gate_price, moq, unit,
          mfg_location_city, mfg_location_state, sample_available, oem_available,
          product_media ( public_url_or_reference, is_primary ),
          brands ( name ),
          company_profiles!products_seller_id_fkey ( display_name, kyc_status )
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .is('deleted_at', null)
        .limit(8)
        .order('created_at', { ascending: false }),

      supabase
        .from('products')
        .select(`
          id, name, slug, base_price, factory_gate_price, moq, unit,
          mfg_location_city, mfg_location_state, sample_available, oem_available,
          product_media ( public_url_or_reference, is_primary ),
          brands ( name ),
          company_profiles!products_seller_id_fkey ( display_name, kyc_status )
        `)
        .eq('status', 'active')
        .is('deleted_at', null)
        .limit(8)
        .order('created_at', { ascending: false }),
    ])

    if (indsRes.status === 'fulfilled' && indsRes.value.data?.length) {
      industries = indsRes.value.data as Industry[]
    }
    if (featuredRes.status === 'fulfilled' && featuredRes.value.data?.length) {
      featuredProducts = featuredRes.value.data.map((p, i) =>
        normalizeProduct(p, FALLBACK_FEATURED[i % FALLBACK_FEATURED.length])
      )
    }
    if (latestRes.status === 'fulfilled' && latestRes.value.data?.length) {
      latestProducts = latestRes.value.data.map((p, i) =>
        normalizeProduct(p, FALLBACK_LATEST[i % FALLBACK_LATEST.length])
      )
    }
  } catch (err) {
    console.error('[Home] data load error — using fallbacks:', err)
  }

  const dealEnd = getTodayEnd()

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#0F172A] pb-24 md:pb-8 font-sans">
      <StitchHeader />

      <main>

        {/* INDUSTRY TABS — sticky below header */}
        <div className="bg-white border-b border-slate-200 sticky top-[56px] z-30 overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex items-start gap-0 min-w-max px-3 py-1">
              {/* "All" tab */}
              <Link
                href="/products"
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 border-b-2 border-[#C4973A] flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[#C4973A]" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                  storefront
                </span>
                <span className="text-[9px] font-black text-[#C4973A] whitespace-nowrap">All</span>
              </Link>

              {industries.map((ind) => (
                <Link
                  key={ind.id}
                  href={`/products?industry=${ind.slug}`}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 border-b-2 border-transparent hover:border-[#C4973A]/50 flex-shrink-0 group transition-colors"
                >
                  <span
                    className="material-symbols-outlined text-slate-400 group-hover:text-[#C4973A] transition-colors"
                    style={{ fontSize: '20px', fontVariationSettings: "'FILL' 0" }}
                  >
                    {INDUSTRY_ICONS[ind.slug] ?? 'category'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-[#0F172A] whitespace-nowrap transition-colors">
                    {ind.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto">

          {/* BUSINESS ESSENTIALS — 4x2 image tile grid */}
          <section className="px-4 pt-5 pb-2">
            <SectionHeader title="Business Essentials" label="Source Direct" href="/products" />
            <div className="grid grid-cols-4 gap-2">
              {BUSINESS_ESSENTIALS.map((cat) => (
                <CategoryTile key={cat.slug} {...cat} />
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-200 mx-4 my-5" />

          {/* HOT WHOLESALE DEALS — horizontal scroll */}
          <section className="pb-2">
            <div className="px-4 flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#C4973A] block mb-0.5">
                  Factory-direct prices
                </span>
                <h2 className="text-[18px] font-black text-[#0F172A] tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-orange-500" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                  Hot Wholesale Deals
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Bulk orders. Limited slab pricing.</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                <DealTimer targetDate={dealEnd} label="Ends" />
                <Link
                  href="/products?featured=true"
                  className="flex items-center gap-1.5 bg-[#C4973A] text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-md uppercase tracking-wide"
                >
                  <span className="material-symbols-outlined text-[12px]">shuffle</span>
                  All Deals
                </Link>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory">
              {featuredProducts.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-[155px] snap-start">
                  <StitchProductCard product={p} />
                </div>
              ))}
              {/* See All card */}
              <div className="flex-shrink-0 w-[155px] snap-start">
                <Link
                  href="/products?featured=true"
                  className="flex flex-col items-center justify-center h-full min-h-[220px] bg-white rounded-[18px] border border-slate-200 hover:border-[#C4973A]/40 shadow-sm transition-all gap-2 group"
                >
                  <span className="w-10 h-10 rounded-full bg-[#C4973A]/10 flex items-center justify-center group-hover:bg-[#C4973A]/20 transition-colors">
                    <span className="material-symbols-outlined text-[#C4973A] text-[20px]">arrow_forward</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 group-hover:text-[#0F172A] transition-colors">See all deals</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-200 mx-4 my-5" />

          {/* SUPPLIERS IN SPOTLIGHT — 4x2 icon tile grid */}
          <section className="px-4 pb-2">
            <SectionHeader title="Suppliers in Spotlight" label="KYC Verified" href="/products" hrefLabel="Explore All" />
            <div className="grid grid-cols-4 gap-2">
              {SUPPLIER_TYPES.map((s) => (
                <SupplierTile key={s.name} {...s} />
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-200 mx-4 my-5" />

          {/* FMCG & CONSUMER GOODS — 4x2 subcategory grid */}
          <section className="px-4 pb-2">
            <SectionHeader
              title="FMCG & Consumer Goods"
              label="Top Moving"
              href="/products?industry=fmcg-personal-care"
            />
            <div className="grid grid-cols-4 gap-2">
              {FMCG_SUBCATS.map((cat) => (
                <CategoryTile key={cat.slug} {...cat} />
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-200 mx-4 my-5" />

          {/* RFQ PROMO BANNER */}
          <section className="px-4 pb-2">
            <Link
              href="/rfq/new"
              className="relative flex items-center overflow-hidden bg-gradient-to-r from-[#0F2016] via-[#1A2E1A] to-[#0F1A2E] rounded-2xl p-5 border border-white/10 hover:border-[#C4973A]/30 transition-all group shadow-lg"
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#C4973A]/10 rounded-full blur-2xl" />
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />

              <div className="relative z-10 flex-1">
                <span className="inline-flex items-center gap-1 bg-[#C4973A]/20 text-[#C4973A] text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest mb-2">
                  <span className="material-symbols-outlined text-[10px]">bolt</span>
                  Free Service
                </span>
                <h3 className="text-[16px] font-black text-white leading-tight mb-1">
                  Need bulk sourcing?
                  <br />Post an RFQ — Get 5+ quotes
                </h3>
                <p className="text-[11px] text-white/60">12,000+ verified suppliers will bid for you</p>
              </div>

              <div className="relative z-10 flex-shrink-0 ml-4">
                <span className="flex items-center gap-1.5 bg-[#C4973A] text-white text-[11px] font-black px-4 py-2.5 rounded-xl shadow-lg group-hover:bg-[#b08530] transition-colors">
                  Post RFQ
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </span>
              </div>
            </Link>
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-200 mx-4 my-5" />

          {/* NEW FROM FACTORIES — horizontal scroll */}
          <section className="pb-2">
            <div className="px-4 mb-3">
              <SectionHeader title="New From Factories" label="Just Listed" href="/products" />
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory">
              {latestProducts.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-[155px] snap-start">
                  <StitchProductCard product={p} />
                </div>
              ))}
              <div className="flex-shrink-0 w-[155px] snap-start">
                <Link
                  href="/products"
                  className="flex flex-col items-center justify-center h-full min-h-[220px] bg-white rounded-[18px] border border-slate-200 hover:border-[#C4973A]/40 shadow-sm transition-all gap-2 group"
                >
                  <span className="w-10 h-10 rounded-full bg-[#C4973A]/10 flex items-center justify-center group-hover:bg-[#C4973A]/20 transition-colors">
                    <span className="material-symbols-outlined text-[#C4973A] text-[20px]">arrow_forward</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 group-hover:text-[#0F172A] transition-colors">See all new</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-200 mx-4 my-5" />

          {/* AGRI & FOOD — 4x2 subcategory grid */}
          <section className="px-4 pb-2">
            <SectionHeader
              title="Agri & Food"
              label="Farm to B2B"
              href="/products?industry=agri-food"
            />
            <div className="grid grid-cols-4 gap-2">
              {AGRI_SUBCATS.map((cat) => (
                <CategoryTile key={cat.slug} {...cat} />
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-200 mx-4 my-5" />

          {/* B2B CAPABILITIES — horizontal scroll cards */}
          <section className="px-4 pb-2">
            <SectionHeader title="Built for B2B" />
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x">
              {[
                { icon: 'factory',        title: 'OEM / ODM',          body: 'Custom manufacturing with verified Indian factories. MOQ negotiable.',  color: 'bg-[#0F2016] border-emerald-900/40' },
                { icon: 'verified_user',  title: 'KYC Verified Only',  body: 'Every supplier goes through GST, MSME & trade license verification.',   color: 'bg-[#0F0F26] border-indigo-900/40' },
                { icon: 'local_shipping', title: 'End-to-End Freight', body: 'Integrated freight quotes — Porter, BlackBuck & more, pan-India.',      color: 'bg-[#1A0A0A] border-red-900/40' },
                { icon: 'lock',           title: 'Escrow Payments',    body: 'Money released only on buyer confirmation. Zero risk sourcing.',          color: 'bg-[#0A1A1A] border-cyan-900/40' },
              ].map((card) => (
                <div
                  key={card.title}
                  className={`flex-shrink-0 w-[220px] snap-start ${card.color} rounded-2xl p-4 border flex gap-3 shadow-md`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#C4973A] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {card.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-white">{card.title}</h3>
                    <p className="text-[10px] text-white/55 mt-1 leading-snug">{card.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-200 mx-4 my-5" />

          {/* STATS STRIP — 4 columns */}
          <section className="px-4 pb-2">
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: '12K+',   label: 'Verified\nSuppliers' },
                { value: '5L+',    label: 'Products\nListed' },
                { value: '28',     label: 'States\nCovered' },
                { value: '200Cr',  label: 'GMV\nFacilitated' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-slate-200 shadow-sm">
                  <div className="text-[17px] font-black text-[#C4973A] leading-tight">{s.value}</div>
                  <div className="text-[8px] text-slate-500 font-semibold mt-0.5 leading-tight whitespace-pre-line">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SELLER CTA */}
          <section className="px-4 py-5">
            <div className="relative bg-gradient-to-br from-[#0F1520] via-[#1A1F2E] to-[#0F1520] rounded-2xl p-6 overflow-hidden border border-white/10 shadow-xl">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#C4973A]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1 bg-[#C4973A]/20 text-[#C4973A] text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest mb-3">
                  <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>store</span>
                  For Manufacturers & Distributors
                </span>
                <h2 className="text-[20px] font-black text-white tracking-tight leading-tight mb-1">
                  Ready to grow your<br />wholesale business?
                </h2>
                <p className="text-[12px] text-white/55 mb-4">Join 12,000+ suppliers already selling on THOKSALE.</p>
                <div className="flex gap-2.5">
                  <Link
                    href="/register"
                    className="bg-[#C4973A] hover:bg-[#b08530] text-white font-black text-[12px] px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    Start Selling Free
                  </Link>
                  <Link
                    href="/products"
                    className="bg-white/10 hover:bg-white/15 text-white border border-white/15 font-bold text-[12px] px-5 py-2.5 rounded-xl transition-all"
                  >
                    Explore Catalog
                  </Link>
                </div>
              </div>
            </div>
          </section>

        </div>{/* /max-w container */}
      </main>

      <StitchBottomNav />
    </div>
  )
}
