import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Compass, Home, Search } from 'lucide-react'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-12">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/20">
          <Compass className="h-6 w-6" aria-hidden />
        </div>
        <div className="space-y-2">
          <span className="eyebrow justify-center"><span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />404 — off the map</span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">This page doesn&apos;t exist</h1>
          <p className="text-sm md:text-base text-muted-foreground">The link is broken or the item is no longer available.</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <Button asChild variant="accent" className="gap-2"><Link href="/"><Home className="h-4 w-4" /> Home</Link></Button>
          <Button asChild variant="outline" className="gap-2"><Link href="/products"><Search className="h-4 w-4" /> Browse products</Link></Button>
        </div>
      </div>
    </div>
  )
}
