'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function AccountSignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
      router.push('/login')
      router.refresh()
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="w-full py-3.5 px-4 rounded-2xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold text-xs bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs active:scale-95 disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[18px]">logout</span>
      <span>{loading ? 'Signing out...' : 'Sign Out of Account'}</span>
    </button>
  )
}
