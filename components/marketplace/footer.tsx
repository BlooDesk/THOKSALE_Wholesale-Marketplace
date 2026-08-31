import Link from 'next/link'
import { ShieldCheck, ArrowUpRight, Award, Shield, CheckCircle } from 'lucide-react'

export function AppFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="w-full border-t border-zinc-200/50 bg-[#FAFAF9] text-zinc-900 mt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="grid gap-12 py-16 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] border-b border-zinc-200/40">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-gradient-to-tr from-zinc-950 to-zinc-800 text-white shadow-md border border-zinc-200/10">
                <span className="h-2 w-2 rounded-full bg-[#B5924D]" />
              </span>
              <span className="text-xl font-black tracking-[-0.03em]">
                Thok<span className="text-[#B5924D] font-extrabold">Sale</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-600 font-medium">
              India's premier institutional B2B wholesale settlement rail. Connecting verified retailers with first-party manufacturers with transparent pricing and zero brokerage.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-zinc-400">Security & Compliance</span>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/50 text-emerald-800 text-[11px] font-bold shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>GST Verified</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100/80 border border-zinc-200/30 text-zinc-700 text-[11px] font-bold shadow-sm">
                  <Shield className="h-3.5 w-3.5 text-[#B5924D]" />
                  <span>ISO 27001 Certified</span>
                </div>
              </div>
            </div>
          </div>

          <FooterCol title="Marketplace">
            <FooterLink href="/products">All Products</FooterLink>
            <FooterLink href="/products">Featured Industries</FooterLink>
            <FooterLink href="/rfq/new" highlight>Request a Quote <ArrowUpRight className="h-3.5 w-3.5 ml-0.5 inline-block opacity-70" /></FooterLink>
          </FooterCol>

          <FooterCol title="For Businesses">
            <FooterLink href="/register">Become a Supplier</FooterLink>
            <FooterLink href="/register">Register as Buyer</FooterLink>
            <FooterLink href="/account">Institutional Account</FooterLink>
          </FooterCol>

          <FooterCol title="Platform & Trust">
            <FooterLink href="/">About ThokSale</FooterLink>
            <FooterLink href="/">Trust & Safety Rail</FooterLink>
            <FooterLink href="/">Institutional Contact</FooterLink>
          </FooterCol>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 py-8 md:flex-row md:items-center">
          <span className="text-xs font-semibold text-zinc-500">
            © {year} ThokSale Technologies Pvt. Ltd. All rights reserved.
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#B5924D]">
              Verified · Transparent · Brokerage-Free
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">{title}</h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children, highlight = false }: { href: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <li>
      <Link 
        href={href} 
        className={`text-sm font-bold transition-all hover:translate-x-0.5 inline-flex items-center ${
          highlight 
            ? 'text-[#B5924D] hover:text-[#a38141]' 
            : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
        }`}
      >
        {children}
      </Link>
    </li>
  )
}

