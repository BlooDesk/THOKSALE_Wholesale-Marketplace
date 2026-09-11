import Link from 'next/link'

const TRUST_ITEMS = [
  { icon: 'verified_user', label: 'KYC-Verified B2B Network' },
  { icon: 'currency_rupee', label: 'Direct Factory Pricing' },
  { icon: 'handshake', label: 'Escrow-Protected Payments' },
  { icon: 'local_shipping', label: 'Pan-India Freight Network' },
]

const STATS = [
  { value: '10K+', label: 'Verified Suppliers' },
  { value: '50K+', label: 'Active Buyers' },
  { value: '₹500Cr+', label: 'GMV Transacted' },
]

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* LEFT — Branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-shrink-0 flex-col relative overflow-hidden bg-[#0F172A]">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Gradient blobs */}
        <div className="absolute top-1/4 -left-24 w-72 h-72 bg-[#B5924D]/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 -right-12 w-56 h-56 bg-indigo-500/10 rounded-full blur-[60px]" />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-12">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="font-mono text-2xl font-black tracking-tighter text-white">
              THOK<span className="text-[#B5924D]">SALE</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 border border-slate-700 rounded-full px-2 py-0.5">
              B2B
            </span>
          </Link>

          {/* Headline */}
          <div className="mt-auto mb-auto pt-16 space-y-6">
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
              India's #1<br />
              <span className="text-[#B5924D]">Wholesale</span><br />
              Marketplace
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Connect directly with verified manufacturers, negotiate slab pricing, and manage B2B trade at scale.
            </p>

            {/* Trust items */}
            <div className="space-y-3 pt-2">
              {TRUST_ITEMS.map((t) => (
                <div key={t.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#B5924D]/15 border border-[#B5924D]/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px] text-[#B5924D]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {t.icon}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-auto pt-8 border-t border-slate-800">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-black text-white">{s.value}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Form panel */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#F9F8F4] dark:bg-[#0A0D14] overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden px-6 pt-8 pb-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-mono text-xl font-black tracking-tighter text-[#0F172A] dark:text-white">
              THOK<span className="text-[#B5924D]">SALE</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-[420px] mx-auto">
            {children}
          </div>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-[11px] text-slate-400">
            © 2024 ThokSale Pvt Ltd •{' '}
            <Link href="/privacy" className="hover:text-[#B5924D] transition-colors">Privacy Policy</Link>
            {' '}•{' '}
            <Link href="/terms" className="hover:text-[#B5924D] transition-colors">Terms of Service</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function OrDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-700" />
      </div>
      <div className="relative flex justify-center text-[11px]">
        <span className="bg-[#F9F8F4] dark:bg-[#0A0D14] px-3 text-slate-400 font-semibold uppercase tracking-wider">
          or continue with email
        </span>
      </div>
    </div>
  )
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{subtitle}</p>}
    </div>
  )
}

export function AuthField({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          {error}
        </p>
      )}
    </div>
  )
}
