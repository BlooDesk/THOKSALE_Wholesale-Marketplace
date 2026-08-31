import Link from 'next/link'
import type { ReactNode } from 'react'
import { ShieldCheck, Quote } from 'lucide-react'

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-primary text-primary-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <span className="text-xl font-bold tracking-[-0.02em] text-foreground">Thok<span className="text-accent">Sale</span></span>
    </span>
  )
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      {/* LEFT — Editorial marketing panel */}
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-14">
        {/* subtle warm noise */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 20%, hsl(40 52% 54%), transparent 45%), radial-gradient(circle at 75% 80%, hsl(40 52% 54%), transparent 40%)' }}
          aria-hidden
        />

        <Link href="/" className="relative z-10 inline-flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-primary-foreground text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span className="text-xl font-bold tracking-[-0.02em] text-primary-foreground">Thok<span className="text-accent">Sale</span></span>
        </Link>

        <div className="relative z-10 max-w-md">
          <Quote className="h-8 w-8 [color:hsl(var(--accent))]" strokeWidth={1.5} />
          <blockquote className="mt-6 text-[26px] font-semibold leading-[1.25] tracking-[-0.02em] text-primary-foreground text-balance">
            “We cleared our monthly fabric procurement in two hours — with full price transparency and freight sorted upfront.”
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-foreground/10 ring-1 ring-primary-foreground/15" />
            <div>
              <div className="text-sm font-semibold text-primary-foreground">Rakesh M.</div>
              <div className="text-xs text-primary-foreground/60">Head of Procurement, Orion Mills</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-primary-foreground/60">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 [color:hsl(var(--success))]" /> SOC 2 Type II</span>
          <span>ISO 27001</span>
          <span>GST verified</span>
        </div>
      </aside>

      {/* RIGHT — form */}
      <main className="relative flex flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-6 lg:px-10">
          <Link href="/" className="lg:hidden"><Logo /></Link>
          <Link href="/" className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            ← Back to marketplace
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16 lg:px-10">
          <div className="w-full max-w-md animate-fade-in-up">
            <h1 className="text-3xl md:text-[34px] font-bold tracking-[-0.03em] text-foreground leading-[1.1] text-balance">{title}</h1>
            {subtitle && <p className="mt-3 text-[15px] text-muted-foreground text-pretty">{subtitle}</p>}
            <div className="mt-9">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  )
}
