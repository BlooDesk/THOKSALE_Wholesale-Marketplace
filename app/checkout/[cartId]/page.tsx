import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StitchHeader } from '@/components/marketplace/stitch-header'
import { StitchBottomNav } from '@/components/marketplace/stitch-bottom-nav'
import { StitchCheckoutForm } from './checkout-form'

export default async function CheckoutPage(props: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await props.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let cartData: any = null
  let defaultAddress: any = {
    full_name: 'Rahul Sharma (Purchase Dept)',
    company_name: 'Apex Retailers & Wholesalers Pvt Ltd',
    gstin: '27AABCA1234F1Z5',
    phone: '+91 98765 43210',
    email: user?.email || 'buyer@apexretail.in',
    line1: 'Unit 402, Trade Square Logistics Park, Hinjewadi Phase 1',
    city: 'Pune',
    state: 'Maharashtra',
    postal_code: '411057',
    country: 'India',
  }

  if (user && !cartId.startsWith('cart-demo')) {
    const { data: cart } = await supabase
      .from('carts')
      .select(`
        id, seller_id, buyer_id, partner_code_id, currency, is_active,
        partner_code:partner_codes ( id, code, discount_type, discount_value ),
        seller:company_profiles!seller_id ( display_name, legal_name, city, state, logo_url, kyc_status ),
        cart_items ( id, quantity, products ( id, title, slug, sku, base_price, min_order_quantity, stock_quantity, unit, images, tax_rate ) )
      `)
      .eq('id', cartId)
      .maybeSingle()

    if (cart) {
      cartData = cart
    }

    const { data: buyerCompany } = await supabase
      .from('company_profiles')
      .select('legal_name, address_line1, address_line2, city, state, postal_code, country, contact_email, contact_phone, tax_id')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (buyerCompany) {
      defaultAddress = {
        full_name: buyerCompany.legal_name || defaultAddress.full_name,
        company_name: buyerCompany.legal_name || defaultAddress.company_name,
        gstin: buyerCompany.tax_id || defaultAddress.gstin,
        phone: buyerCompany.contact_phone || defaultAddress.phone,
        email: buyerCompany.contact_email || user.email || defaultAddress.email,
        line1: buyerCompany.address_line1 || defaultAddress.line1,
        city: buyerCompany.city || defaultAddress.city,
        state: buyerCompany.state || defaultAddress.state,
        postal_code: buyerCompany.postal_code || defaultAddress.postal_code,
        country: buyerCompany.country || 'India',
      }
    }
  }

  // Fallback demo cart if testing locally without DB items
  if (!cartData) {
    cartData = {
      id: cartId,
      currency: 'INR',
      seller: {
        display_name: 'TechAudio Manufacturing Ltd',
        city: 'Pune',
        state: 'Maharashtra',
        kyc_status: 'verified',
      },
      cart_items: [
        {
          id: 'ci-demo-1',
          quantity: 50,
          products: {
            id: 'p-1',
            title: '10000mAh PD Fast Charging Power Bank Type-C Dual Output',
            unit: 'pcs',
            base_price: 850,
            images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60'],
          },
        },
      ],
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#0B0B0F] text-[#0F172A] dark:text-slate-100 pb-32 font-sans">
      <StitchHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Top Progress Indicator */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col items-center flex-1">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-1">
              ✓
            </div>
            <span className="text-[11px] font-bold text-emerald-600">Cart</span>
          </div>
          <div className="h-0.5 bg-emerald-600 flex-1 mx-2"></div>
          <div className="flex flex-col items-center flex-1">
            <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs mb-1 ring-2 ring-[#B5924D]/40">
              2
            </div>
            <span className="text-[11px] font-bold text-[#0F172A] dark:text-white">Review & Address</span>
          </div>
          <div className="h-0.5 bg-slate-200 dark:bg-slate-700 flex-1 mx-2"></div>
          <div className="flex flex-col items-center flex-1">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs mb-1">
              3
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Escrow Payment</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Wholesale Checkout
          </h1>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Cart ID: {cartId.slice(0, 8)}
          </span>
        </div>

        {/* Form Component */}
        <StitchCheckoutForm cart={cartData} defaultAddress={defaultAddress} />
      </main>

      <StitchBottomNav />
    </div>
  )
}
