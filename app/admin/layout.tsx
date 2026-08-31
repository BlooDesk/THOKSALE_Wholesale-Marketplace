import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Users, LayoutGrid, Package, Receipt, FileText, Home, ShieldAlert, Building2, Tag, Ruler, Briefcase, ListTree } from 'lucide-react'

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-primary-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <span className="text-[15px] font-bold tracking-[-0.02em] text-foreground">Thok<span className="text-accent">Sale</span> <span className="text-muted-foreground font-medium">· Admin</span></span>
    </span>
  )
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin')
  const { data: profile } = await supabase.from('profiles').select('role, is_active').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin' || !profile.is_active) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10">
            <ShieldAlert className="h-6 w-6 [color:hsl(var(--destructive))]" />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">This area is restricted.</p>
          <Link href="/" className="mt-6 inline-block"><Button variant="outline">Back home</Button></Link>
        </div>
      </div>
    )
  }

  const primary = [
    { href: '/admin',            label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users',      label: 'Users',     icon: Users },
    { href: '/admin/orders',     label: 'Orders',    icon: Receipt },
    { href: '/admin/rfqs',       label: 'RFQs',      icon: FileText },
    { href: '/admin/products',   label: 'Products',  icon: Package },
  ]
  const catalog = [
    { href: '/admin/industries',           label: 'Industries',    icon: Building2 },
    { href: '/admin/categories',           label: 'Categories',    icon: LayoutGrid },
    { href: '/admin/attribute-templates',  label: 'Attributes',    icon: ListTree },
    { href: '/admin/brands',               label: 'Brands',        icon: Tag },
  ]
  const config = [
    { href: '/admin/units',           label: 'Units',           icon: Ruler },
    { href: '/admin/business-types',  label: 'Business Types',  icon: Briefcase },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6 lg:px-8">
          <Link href="/admin"><Logo /></Link>
          <div className="flex items-center gap-2">
            <Link href="/"><Button variant="ghost" size="sm"><Home className="mr-1 h-4 w-4" /> Site</Button></Link>
            <form action="/auth/signout" method="post">
              <Button variant="outline" size="sm" type="submit"><LogOut className="mr-1.5 h-4 w-4" /> Sign out</Button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 overflow-x-auto no-scrollbar px-5 pb-2.5 text-xs sm:px-6 lg:px-8">
          {primary.map((n) => <NavItem key={n.href} {...n} />)}
          <Divider />
          {catalog.map((n) => <NavItem key={n.href} {...n} />)}
          <Divider />
          {config.map((n) => <NavItem key={n.href} {...n} />)}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
  return (
    <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors">
      <Icon className="h-3.5 w-3.5" /> {label}
    </Link>
  )
}
function Divider() { return <span className="mx-1 h-4 w-px shrink-0 bg-border" /> }
