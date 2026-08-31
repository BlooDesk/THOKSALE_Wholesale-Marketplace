'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[ThokSale] runtime error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-12">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-100">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Something went wrong</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            An unexpected error occurred while loading this page. You can try again, or head back to safety.
          </p>
          {error?.digest && (
            <p className="text-[11px] text-muted-foreground/70 font-mono">ref: {error.digest}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <Button onClick={reset} variant="accent" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/"><Home className="h-4 w-4" /> Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
