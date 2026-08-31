import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://loucicojxclppvigovsa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdWNpY29qeGNscHB2aWdvdnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE4ODM0MiwiZXhwIjoyMTAxNzY0MzQyfQ.G-F5VgXFbj3PAqUJRyo2qVLdlr-yTopLWxxouQ0V5tI'

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function inspectData() {
  const { data: products } = await client.from('products').select('id, name, slug, base_price, moq, stock_quantity, status').limit(5)
  console.log('Sample Products:', products)

  const { data: categories } = await client.from('categories').select('id, name, slug').limit(5)
  console.log('Sample Categories:', categories)

  const { data: users } = await client.from('profiles').select('id, email, role, full_name').limit(5)
  console.log('Sample Users:', users)
}

inspectData()
