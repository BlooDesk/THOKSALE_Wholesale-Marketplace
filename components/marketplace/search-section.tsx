'use client'

import { useState, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'

export function SearchSection() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isPending, setIsPending] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsPending(true)
    startTransition(() => {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`)
      setIsPending(false)
    })
  }

  const handleQuickTag = (tag: string) => {
    setQuery(tag)
    setIsPending(true)
    startTransition(() => {
      router.push(`/products?q=${encodeURIComponent(tag)}`)
      setIsPending(false)
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSearch} className="relative group">
        <div className="relative flex items-center">
          <Search className="absolute left-5 h-5 w-5 text-zinc-400 group-focus-within:text-[#B5924D] transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What products or industrial supplies are you looking for?"
            className="w-full h-14 pl-14 pr-32 rounded-full border border-zinc-200/80 bg-white shadow-sm placeholder:text-zinc-400 text-sm font-medium focus:outline-none focus:border-[#B5924D] focus:ring-4 focus:ring-[#B5924D]/10 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={isPending}
            className="absolute right-2 px-6 h-10 rounded-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs tracking-wide uppercase shadow-md active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Quick suggestions tag group with Apple-level spacing */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1.5">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 mr-1.5">Quick search:</span>
        {['Textiles', 'Electronics', 'Packaging', 'Agri Products', 'Machinery'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleQuickTag(tag)}
            className="px-3.5 py-1.5 rounded-full bg-zinc-50 border border-zinc-100/80 text-[11px] font-bold text-zinc-600 hover:bg-[#B5924D]/10 hover:border-[#B5924D]/30 hover:text-[#B5924D] active:scale-95 transition-all duration-200"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
