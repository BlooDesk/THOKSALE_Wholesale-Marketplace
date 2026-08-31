import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://loucicojxclppvigovsa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdWNpY29qeGNscHB2aWdvdnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE4ODM0MiwiZXhwIjoyMTAxNzY0MzQyfQ.G-F5VgXFbj3PAqUJRyo2qVLdlr-yTopLWxxouQ0V5tI'

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function testProductQuery() {
  const { data, error } = await client
    .from('products')
    .select(`
      id,
      name,
      slug,
      factory_gate_price,
      moq,
      unit,
      description,
      product_media (
        public_url_or_reference,
        is_primary
      ),
      brand:brands (
        name
      )
    `)
    .limit(4)

  console.log('Query Error:', error)
  console.log('Products returned:', JSON.stringify(data, null, 2))
}

testProductQuery()
