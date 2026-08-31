import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://loucicojxclppvigovsa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdWNpY29qeGNscHB2aWdvdnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxODgzNDIsImV4cCI6MjEwMTc2NDM0Mn0.rz2YbnCGFb51AjZuqSkhUr0utbfWcTKW9CdAHF-awLk'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdWNpY29qeGNscHB2aWdvdnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE4ODM0MiwiZXhwIjoyMTAxNzY0MzQyfQ.G-F5VgXFbj3PAqUJRyo2qVLdlr-yTopLWxxouQ0V5tI'

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function testTables() {
  console.log('--- Testing Supabase Backend Connection ---')
  const tables = [
    'profiles',
    'company_profiles',
    'categories',
    'industries',
    'brands',
    'units',
    'products',
    'product_images',
    'carts',
    'cart_items',
    'orders',
    'order_items',
    'rfqs',
    'rfq_quotes',
    'partner_codes',
    'notifications'
  ]

  const results = {}

  for (const table of tables) {
    try {
      const { data, error, count } = await client.from(table).select('*', { count: 'exact', head: true })
      if (error) {
        results[table] = { status: 'ERROR', message: error.message, code: error.code }
      } else {
        results[table] = { status: 'OK', count }
      }
    } catch (e) {
      results[table] = { status: 'EXCEPTION', message: e.message }
    }
  }

  console.log(JSON.stringify(results, null, 2))
}

testTables()
