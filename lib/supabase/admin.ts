import { createClient as createSbClient } from '@supabase/supabase-js'

// Service-role client. Bypasses RLS. Use ONLY on the server for privileged ops
// like creating a profile row after signup.
export function createAdminClient() {
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
