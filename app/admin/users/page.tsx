import { createClient } from '@/lib/supabase/server'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { UserRowActions } from './row-actions'

export const dynamic = 'force-dynamic'

export default async function AdminUsers(props: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const sp = await props.searchParams
  const q = (sp.q || '').trim()
  const role = sp.role || 'all'
  const supabase = await createClient()
  let query = supabase.from('profiles')
    .select('id, role, full_name, email, phone, is_active, created_at, company_profiles(legal_name, display_name, kyc_status)')
    .order('created_at', { ascending: false }).limit(200)
  if (q) query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
  if (role !== 'all') query = query.eq('role', role)
  const { data: users } = await query

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />Directory</span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-foreground">Users</h1>
        </div>
        <form className="flex flex-wrap items-center gap-2" method="GET">
          <select name="role" defaultValue={role} className="h-10 rounded-2xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:border-accent">
            <option value="all">All roles</option><option value="buyer">Buyers</option><option value="seller">Sellers</option><option value="admin">Admins</option>
          </select>
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="Search email/name" className="h-10 pl-9 text-sm w-56" /></div>
          <Button type="submit" size="default" variant="outline">Search</Button>
        </form>
      </div>

      <div className="mt-8 overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-soft">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary/60 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <tr><th className="px-6 py-3.5">Name</th><th className="px-6 py-3.5">Role</th><th className="px-6 py-3.5">Company</th><th className="px-6 py-3.5">KYC</th><th className="px-6 py-3.5">Status</th><th className="px-6 py-3.5">Joined</th><th className="px-6 py-3.5" /></tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {(users || []).map((u: any) => {
              const c = u.company_profiles
              return (
                <tr key={u.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4"><div className="font-semibold text-foreground">{u.full_name || '—'}</div><div className="text-xs text-muted-foreground">{u.email}</div></td>
                  <td className="px-6 py-4 capitalize text-foreground/85">{u.role}</td>
                  <td className="px-6 py-4 text-foreground/85">{c?.display_name || c?.legal_name || '—'}</td>
                  <td className="px-6 py-4"><Badge variant={c?.kyc_status === 'verified' ? 'success' : 'secondary'} className="capitalize">{c?.kyc_status || '—'}</Badge></td>
                  <td className="px-6 py-4"><Badge variant={u.is_active ? 'success' : 'muted'}>{u.is_active ? 'Active' : 'Suspended'}</Badge></td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><UserRowActions userId={u.id} isActive={u.is_active} role={u.role} kycStatus={c?.kyc_status} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
