import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://loucicojxclppvigovsa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdWNpY29qeGNscHB2aWdvdnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE4ODM0MiwiZXhwIjoyMTAxNzY0MzQyfQ.G-F5VgXFbj3PAqUJRyo2qVLdlr-yTopLWxxouQ0V5tI'

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function inspectMediaAndAccounts() {
  const { data: media } = await client.from('product_media').select('*').limit(2)
  console.log('Sample product_media:', media)

  const { data: accounts } = await client.from('business_accounts').select('*').limit(2)
  console.log('Sample business_accounts:', accounts)

  const { data: pricingRules } = await client.from('pricing_rules').select('*').limit(3)
  console.log('Sample pricing_rules:', pricingRules)
}

inspectMediaAndAccounts()
