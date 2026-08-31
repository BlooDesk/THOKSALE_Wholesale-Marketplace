import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gwosqfpxqukmqjaobhms.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3b3NxZnB4cXVrbXFqYW9iaG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MDE2ODIsImV4cCI6MjA5ODk3NzY4Mn0.8EEi-Noy8VDcvNyBHWCmd-d87chqhQOV3lfl_FCuDlE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const slug = 'pricing-qa-widget-abc001'

console.log('Testing product fetch with slug:', slug)

const { data, error } = await supabase
  .from('products')
  .select(`
    id, name, slug, sku, description, brand, unit, moq, base_price, currency, tax_rate,
    stock_quantity, weight_kg, dimensions, origin_country, hs_code,
    status, is_featured, specifications, created_at, updated_at,
    category_id,
    categories:category_id ( id, name, slug, parent_id ),
    product_images ( id, url, is_primary, sort_order ),
    seller:profiles!seller_id (
      id, full_name,
      company_profiles!company_profiles_profile_id_fkey (
        legal_name, display_name, tax_id, business_type, website,
        description, city, state, country, logo_url, kyc_status,
        verified_at, rating
      )
    )
  `)
  .eq('status', 'active')
  .is('deleted_at', null)
  .eq('slug', slug)
  .limit(1)

console.log('Error:', error)
console.log('Data:', JSON.stringify(data, null, 2))
console.log('Product found:', data?.[0] ? 'YES' : 'NO')
