import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://loucicojxclppvigovsa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdWNpY29qeGNscHB2aWdvdnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE4ODM0MiwiZXhwIjoyMTAxNzY0MzQyfQ.G-F5VgXFbj3PAqUJRyo2qVLdlr-yTopLWxxouQ0V5tI'

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkRelatedTables() {
  const { data: images, error: imgErr } = await client.from('product_images').select('*').limit(3)
  console.log('Images sample:', images, imgErr)

  // check if slab/tier tables exist
  const tierTables = ['product_pricing_tiers', 'product_pricing_slabs', 'pricing_tiers', 'seller_business_accounts', 'business_accounts']
  for (const t of tierTables) {
    const { data, error } = await client.from(t).select('*').limit(1)
    console.log(`Table ${t}:`, data ? 'EXISTS' : 'NOT FOUND', error?.message)
  }
}

checkRelatedTables()
