import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://loucicojxclppvigovsa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdWNpY29qeGNscHB2aWdvdnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE4ODM0MiwiZXhwIjoyMTAxNzY0MzQyfQ.G-F5VgXFbj3PAqUJRyo2qVLdlr-yTopLWxxouQ0V5tI'

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function inspectSchema() {
  const { data: p, error: pErr } = await client.from('products').select('*').limit(2)
  console.log('Product row sample:', p, 'Error:', pErr)

  const { data: u, error: uErr } = await client.from('profiles').select('*').limit(2)
  console.log('Profile row sample:', u, 'Error:', uErr)
}

inspectSchema()
