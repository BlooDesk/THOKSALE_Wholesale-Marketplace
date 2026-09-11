import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { ProductDetailClient } from './product-client'

export const dynamic = 'force-dynamic'

async function fetchProduct(slugOrId: string) {
  const supabase = await createClient()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId)

  try {
    let query = supabase
      .from('products')
      .select(`
        id, name, slug, description, unit, moq, base_price, factory_gate_price,
        price_min, price_max, stock_quantity, status, supplier_type,
        sample_available, oem_available, odm_available, private_label_avail,
        lead_time_days, payment_terms, hsn_code, gst_rate, country_of_origin,
        mfg_location_city, mfg_location_state, delivery_locations,
        packaging_details, mfg_capacity, certifications,
        category_id, industry_id, brand_id,
        categories:category_id ( id, name, slug ),
        industries:industry_id ( id, name, slug ),
        brands:brand_id ( id, name, logo_url ),
        product_media ( public_url_or_reference, is_primary, alt_text, media_type, sort_order ),
        product_attributes (
          id, value_text, value_number, value_boolean,
          attribute_definitions ( key, label, attr_type, unit )
        ),
        company_profiles!products_seller_id_fkey (
          id, display_name, legal_name, kyc_status, rating, city, state, logo_url, description,
          website, contact_email, contact_phone
        )
      `)
      .eq('status', 'active')
      .limit(1)

    query = isUuid ? query.eq('id', slugOrId) : query.eq('slug', slugOrId)
    const { data } = await query

    if (data && data.length > 0) {
      const p = data[0]
      const basePrice = p.factory_gate_price ?? p.base_price ?? 850
      const moq = p.moq ?? 10

      // Build images array: product_media first, sort by sort_order
      const media = (p.product_media ?? []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      const images = media.length > 0
        ? media.map((m: any) => m.public_url_or_reference).filter(Boolean)
        : ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80']

      // Build specs from product_attributes
      const specifications: Record<string, string> = {}
      ;(p.product_attributes ?? []).forEach((attr: any) => {
        const def = attr.attribute_definitions
        if (!def) return
        const val = attr.value_text ?? (attr.value_number !== null ? String(attr.value_number) : null) ?? (attr.value_boolean !== null ? (attr.value_boolean ? 'Yes' : 'No') : null)
        if (val) specifications[def.label ?? def.key] = `${val}${def.unit ? ' ' + def.unit : ''}`
      })

      // Add PRD-mandated listing fields to specs if not already present
      if (p.hsn_code) specifications['HSN Code'] = p.hsn_code
      if (p.gst_rate) specifications['GST Rate'] = `${p.gst_rate}%`
      if (p.country_of_origin) specifications['Country of Origin'] = p.country_of_origin
      if (p.mfg_capacity) specifications['Mfg. Capacity'] = p.mfg_capacity
      if (p.lead_time_days) specifications['Lead Time'] = `${p.lead_time_days} days`
      if (p.payment_terms) specifications['Payment Terms'] = p.payment_terms
      if (p.packaging_details) specifications['Packaging'] = p.packaging_details

      // Generate slab pricing tiers
      const pricing_tiers = [
        { min_quantity: moq,       max_quantity: moq * 4 - 1,   price: basePrice },
        { min_quantity: moq * 4,   max_quantity: moq * 10 - 1,  price: Math.round(basePrice * 0.92) },
        { min_quantity: moq * 10,  max_quantity: moq * 50 - 1,  price: Math.round(basePrice * 0.85) },
        { min_quantity: moq * 50,  max_quantity: null,           price: Math.round(basePrice * 0.78) },
      ]

      const seller = (p as any)['company_profiles!products_seller_id_fkey'] ?? p.company_profiles
      const brand = (p as any).brands

      return {
        id: p.id,
        title: p.name,
        slug: p.slug,
        description: p.description ?? '',
        unit: (p.unit ?? 'pcs').toLowerCase(),
        min_order_quantity: moq,
        base_price: basePrice,
        price_min: p.price_min ?? basePrice,
        price_max: p.price_max ?? basePrice,
        stock_quantity: p.stock_quantity ?? 9999,
        supplier_type: p.supplier_type,
        sample_available: p.sample_available ?? false,
        oem_available: p.oem_available ?? false,
        odm_available: p.odm_available ?? false,
        private_label_avail: p.private_label_avail ?? false,
        certifications: p.certifications ?? [],
        mfg_location_city: p.mfg_location_city,
        mfg_location_state: p.mfg_location_state,
        images,
        pricing_tiers,
        categories: p.categories ?? { id: '', name: 'General', slug: 'general' },
        industry: p.industries ?? null,
        brand: brand ?? null,
        seller: seller ? {
          profile_id: seller.id,
          display_name: seller.display_name ?? seller.legal_name ?? 'Verified Supplier',
          city: seller.city ?? p.mfg_location_city ?? 'India',
          state: seller.state ?? p.mfg_location_state ?? '',
          rating: seller.rating ?? 4.8,
          kyc_status: seller.kyc_status ?? 'verified',
          logo_url: seller.logo_url,
          description: seller.description,
          website: seller.website,
          contact_email: seller.contact_email,
          contact_phone: seller.contact_phone,
        } : {
          profile_id: 'demo',
          display_name: brand?.name ?? 'Verified Supplier',
          city: p.mfg_location_city ?? 'India',
          state: p.mfg_location_state ?? '',
          rating: 4.8,
          kyc_status: 'verified',
        },
        specifications: Object.keys(specifications).length > 0 ? specifications : {
          'Quality Grade': 'Certified Wholesale Industrial',
          'Origin': 'Direct Factory Dispatch',
          'Packaging': 'Bulk Palletized / Master Carton',
          'Compliance': 'BIS / ISO Standard',
        },
      }
    }
  } catch (err) {
    console.error('[PDP] fetchProduct error:', err)
  }

  // Demo fallback for local dev / empty DB
  return {
    id: slugOrId,
    title: '10000mAh PD Fast Charging Power Bank Type-C Dual Output',
    slug: slugOrId,
    description: 'Industrial grade 10000mAh Power Bank with 22.5W Power Delivery and Quick Charge 3.0 support. Features multi-layer circuit protection, premium matte polycarbonate housing, and digital LED percentage indicator. Ideal for bulk corporate gifting, mobile retail chains, and promotional distribution.',
    unit: 'pcs',
    min_order_quantity: 50,
    base_price: 850,
    price_min: 650,
    price_max: 850,
    stock_quantity: 4500,
    supplier_type: 'manufacturer',
    sample_available: true,
    oem_available: true,
    odm_available: false,
    private_label_avail: true,
    certifications: [{ name: 'BIS Approved' }, { name: 'CE' }, { name: 'RoHS' }],
    mfg_location_city: 'Delhi',
    mfg_location_state: 'Delhi',
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    ],
    pricing_tiers: [
      { min_quantity: 50,   max_quantity: 199,  price: 850 },
      { min_quantity: 200,  max_quantity: 499,  price: 780 },
      { min_quantity: 500,  max_quantity: 1999, price: 720 },
      { min_quantity: 2000, max_quantity: null, price: 650 },
    ],
    categories: { id: 'cat-elec', name: 'Mobile Accessories', slug: 'mobile-accessories' },
    industry: { id: 'ind-elec', name: 'Electronics & Electrical', slug: 'electronics-electrical' },
    brand: null,
    seller: {
      profile_id: 'seller-tech-01',
      display_name: 'ElectroTech India Pvt Ltd',
      city: 'Delhi',
      state: 'Delhi NCR',
      rating: 4.9,
      kyc_status: 'verified',
    },
    specifications: {
      'Battery Capacity': '10000 mAh Lithium Polymer',
      'Output Ports': '1× Type-C (22.5W PD) + 2× USB-A (18W QC3.0)',
      'Input Ports': 'Type-C / Micro-USB',
      'Warranty': '12 Months B2B Replacement',
      'Certifications': 'BIS Approved, CE, RoHS',
      'Packaging': 'Individual Retail Box with Barcode',
      'HSN Code': '85076000',
      'GST Rate': '18%',
      'Country of Origin': 'India',
      'Lead Time': '5-7 days',
      'Payment Terms': '50% Advance, 50% Before Dispatch',
    },
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params
  const product = await fetchProduct(slug)
  if (!product) return { title: 'Product Not Found | THOKSALE' }
  return {
    title: `${product.title} — Wholesale B2B | THOKSALE`,
    description: `Buy ${product.title} at wholesale price ₹${product.base_price}/${product.unit}. MOQ: ${product.min_order_quantity} ${product.unit}. ${(product.description ?? '').slice(0, 100)}`,
    openGraph: {
      title: `${product.title} | THOKSALE Wholesale`,
      images: [{ url: product.images[0] }],
    },
  }
}

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const product = await fetchProduct(slug)
  if (!product) notFound()

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#0A0D14] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="hover:text-[#B5924D] transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/products" className="hover:text-[#B5924D] transition-colors">Catalog</Link>
          {product.industry && (
            <>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <Link href={`/products?industry=${product.industry.id}`} className="hover:text-[#B5924D] transition-colors">
                {product.industry.name}
              </Link>
            </>
          )}
          {product.categories && (
            <>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{product.categories.name}</span>
            </>
          )}
        </nav>
      </div>

      <ProductDetailClient product={product as any} />
    </div>
  )
}
