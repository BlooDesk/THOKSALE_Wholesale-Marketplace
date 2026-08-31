import Link from 'next/link'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, Home } from 'lucide-react'

type NavItem = { href: string; label: string; icon: any; badge?: number }

function Logo({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <span className="text-[15px] font-bold tracking-[-0.02em] text-foreground">{label}</span>
    </span>
  )
}

export function DashboardShell({
  brand,
  brandHref,
  nav,
  currentPath,
  children,
  maxWidth = 'max-w-7xl',
  showSignOut = true,
  extraActions,
}: {
  brand: string
  brandHref: string
  nav: NavItem[]
  currentPath?: string
  children: ReactNode
  maxWidth?: string
  showSignOut?: boolean
  extraActions?: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className={`mx-auto flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6 lg:px-8 ${maxWidth}`}>
          <Link href={brandHref}><Logo label={brand} /></Link>
          <div className="flex items-center gap-2">
            {extraActions}
            <Link href="/"><Button variant="ghost" size="sm"><Home className="mr-1 h-4 w-4" /> Site</Button></Link>
            {showSignOut && (
              <form action="/auth/signout" method="post">
                <Button variant="outline" size="sm" type="submit"><LogOut className="mr-1.5 h-4 w-4" /> Sign out</Button>
              </form>
            )}
          </div>
        </div>
        <nav className={`mx-auto flex gap-1 overflow-x-auto no-scrollbar px-5 pb-2.5 sm:px-6 lg:px-8 ${maxWidth}`}>
          {nav.map((n) => {
            const Icon = n.icon
            const active = currentPath && (currentPath === n.href || currentPath.startsWith(n.href + '/'))
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" /> {n.label}
                {typeof n.badge === 'number' && n.badge > 0 && (
                  <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                    {n.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </header>
      <main className={`mx-auto px-5 py-10 sm:px-6 lg:px-8 ${maxWidth}`}>{children}</main>
    </div>
  )
}
