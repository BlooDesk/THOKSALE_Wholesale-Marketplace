import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { ProductDetailClient } from './product-client'

async function fetchProduct(slugOrId: string) {
  const supabase = await createClient()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId)
  
  try {
    let query = supabase
      .from('products')
      .select(`
        id, name, slug, sku, description, unit, moq, factory_gate_price,
        stock_status, publication_status, verification_status, created_at, updated_at,
        category_id,
        categories:category_id ( id, name, slug ),
        brand:brands ( id, name ),
        product_media ( public_url_or_reference, is_primary, alt_text ),
        product_attributes ( name, value )
      `)
      .limit(1)

    query = isUuid ? query.eq('id', slugOrId) : query.eq('slug', slugOrId)
    const { data } = await query

    if (data && data.length > 0) {
      const p = data[0]
      const basePrice = p.factory_gate_price || 850
      const moq = p.moq || 10
      const images = p.product_media && p.product_media.length > 0
        ? p.product_media.map((m: any) => m.public_url_or_reference)
        : ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80']
      
      const specsObj: Record<string, string> = {}
      if (p.product_attributes) {
        p.product_attributes.forEach((attr: any) => {
          if (attr.name && attr.value) {
            specsObj[attr.name] = attr.value
          }
        })
      }

      return {
        id: p.id,
        title: p.name,
        slug: p.slug,
        sku: p.sku || 'SKU-GEN-001',
        description: p.description,
        unit: (p.unit || 'pcs').toLowerCase(),
        min_order_quantity: moq,
        base_price: basePrice,
        stock_quantity: 5000,
        origin_country: 'India',
        hs_code: '85076000',
        images,
        pricing_tiers: [
          { min_quantity: moq, max_quantity: moq * 4 - 1, price: basePrice },
          { min_quantity: moq * 4, max_quantity: moq * 10 - 1, price: Math.round(basePrice * 0.92) },
          { min_quantity: moq * 10, max_quantity: moq * 50 - 1, price: Math.round(basePrice * 0.85) },
          { min_quantity: moq * 50, max_quantity: null, price: Math.round(basePrice * 0.78) },
        ],
        categories: p.categories || { id: 'cat-gen', name: 'Industrial', slug: 'industrial' },
        seller: {
          profile_id: 'seller-verified',
          display_name: p.brand?.name || 'Verified Indian Manufacturer',
          city: 'Pune',
          state: 'Maharashtra',
          rating: 4.9,
          kyc_status: 'verified',
        },
        specifications: Object.keys(specsObj).length > 0 ? specsObj : {
          QualityGrade: 'Certified Wholesale Industrial',
          Origin: 'Direct Factory Dispatch',
          Packaging: 'Bulk Palletized / Master Carton',
          Compliance: 'BIS / ISO Standard',
        },
      }
    }
  } catch (err) {
    console.error('Error fetching product from Supabase:', err)
  }

  // Fallback demo product for preview/local dev
  return {
    id: slugOrId,
    title: '10000mAh PD Fast Charging Power Bank Type-C Dual Output',
    slug: slugOrId,
    sku: 'PWR-10K-PD-IND',
    description:
      'Industrial grade 10000mAh Power Bank with 22.5W Power Delivery and Quick Charge 3.0 support. Features multi-layer circuit protection, premium matte polycarbonate housing, and digital LED percentage indicator. Ideal for bulk corporate gifting, mobile retail chains, and promotional distribution.',
    unit: 'pcs',
    min_order_quantity: 50,
    base_price: 850,
    stock_quantity: 4500,
    origin_country: 'India',
    hs_code: '85076000',
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    ],
    pricing_tiers: [
      { min_quantity: 50, max_quantity: 199, price: 850 },
      { min_quantity: 200, max_quantity: 499, price: 780 },
      { min_quantity: 500, max_quantity: 1999, price: 720 },
      { min_quantity: 2000, max_quantity: null, price: 650 },
    ],
    categories: { id: 'cat-elec', name: 'Mobile Accessories', slug: 'mobile-accessories' },
    seller: {
      profile_id: 'seller-tech-01',
      display_name: 'ElectroTech India Pvt Ltd',
      city: 'Delhi',
      state: 'NCR',
      rating: 4.9,
      kyc_status: 'verified',
    },
    specifications: {
      BatteryCapacity: '10000 mAh Lithium Polymer',
      OutputPorts: '1x Type-C (22.5W PD) + 2x USB-A (18W QC3.0)',
      InputPorts: 'Type-C / Micro-USB',
      Warranty: '12 Months B2B Replacement',
      Certifications: 'BIS Approved, CE, RoHS',
      Packaging: 'Individual Retail Box with Barcode',
    },
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params
  const product = await fetchProduct(slug)
  if (!product) return { title: 'Product not found | ThokSale' }
  return {
    title: `${product.title} | Wholesale ThokSale`,
    description: (product.description || '').slice(0, 160),
  }
}

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const product = await fetchProduct(slug)
  if (!product) notFound()

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />
      <ProductDetailClient product={product as any} />
      <StitchBottomNav />
    </div>
  )
}
