import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://loucicojxclppvigovsa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdWNpY29qeGNscHB2aWdvdnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE4ODM0MiwiZXhwIjoyMTAxNzY0MzQyfQ.G-F5VgXFbj3PAqUJRyo2qVLdlr-yTopLWxxouQ0V5tI'

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function listCommonTables() {
  const commonNames = [
    'industries', 'categories', 'subcategories', 'product_types', 'brands', 'units',
    'products', 'product_media', 'product_documents', 'product_attributes', 'product_variants',
    'business_accounts', 'business_members', 'business_documents', 'business_addresses',
    'warehouses', 'inventory_lots', 'inventory_movements',
    'price_tiers', 'pricing_rules', 'price_lists',
    'carts', 'cart_items', 'orders', 'order_items', 'order_events',
    'rfqs', 'rfq_quotes', 'rfq_items', 'rfq_messages',
    'dealership_programs', 'dealership_applications',
    'tax_invoices', 'credit_accounts', 'credit_transactions',
    'freight_quotes', 'shipments', 'notifications', 'profiles'
  ]

  console.log('--- Probing Public Schema Tables ---')
  for (const name of commonNames) {
    const { data, error, count } = await client.from(name).select('*', { count: 'exact', head: true })
    if (!error) {
      console.log(`✓ ${name} (count: ${count ?? 0})`)
    }
  }
}

listCommonTables()
