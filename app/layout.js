import './globals.css'
import { Manrope } from 'next/font/google'
import { Providers } from './providers'
import { AuthProvider } from '@/components/auth/auth-provider'
import { Toaster } from '@/components/ui/sonner'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'ThokSale — B2B Wholesale Marketplace',
    template: '%s | ThokSale',
  },
  description: 'Buy and sell wholesale. Simple, verified, at scale — India\'s enterprise-grade B2B marketplace for manufacturers, wholesalers, distributors and retailers.',
  applicationName: 'ThokSale',
  keywords: ['B2B', 'wholesale', 'marketplace', 'India', 'manufacturer', 'distributor', 'RFQ'],
  authors: [{ name: 'ThokSale' }],
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { type: 'website', locale: 'en_IN', siteName: 'ThokSale' },
  robots: { index: true, follow: true },
}

// Next.js 15: viewport / themeColor moved out of `metadata`
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F9F8F4' },
    { media: '(prefers-color-scheme: dark)',  color: '#0A0A0B' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect to Supabase & external image hosts to save handshake time */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://source.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
        {/* Guard: Safari sometimes serialises `PerformanceServerTiming` while cloning worker msgs */}
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-accent/25 selection:text-accent-foreground pb-20 md:pb-0">
        <a href="#main" className="skip-link">Skip to main content</a>
        <Providers>
          <AuthProvider>
            <div id="main" className="min-h-screen flex flex-col">
              {children}
            </div>
            <Toaster richColors position="top-right" closeButton toastOptions={{ className: 'text-sm' }} />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
