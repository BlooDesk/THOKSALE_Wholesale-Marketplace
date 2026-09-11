'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export type UserProfile = {
  id: string
  full_name: string
  email?: string | null
  phone?: string | null
  role: 'buyer' | 'seller' | 'admin'
  company_name?: string | null
  avatar_url?: string | null
  kyc_status?: string | null
}

type AuthCtx = {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  async function loadProfileForUser(u: User | null) {
    if (!u) {
      setProfile(null)
      return
    }

    try {
      // 1. Try profiles table
      const { data: p } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url, status')
        .eq('id', u.id)
        .maybeSingle()

      // 2. Try company_profiles / business_accounts
      const { data: cp } = await supabase
        .from('company_profiles')
        .select('display_name, legal_name, kyc_status')
        .eq('profile_id', u.id)
        .maybeSingle()

      const fullName = p?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Member'
      const role = (u.user_metadata?.role as any) || 'buyer'
      const companyName = cp?.display_name || cp?.legal_name || u.user_metadata?.company_name || null

      setProfile({
        id: u.id,
        full_name: fullName,
        email: u.email,
        phone: p?.phone || u.user_metadata?.phone || null,
        role,
        company_name: companyName,
        avatar_url: p?.avatar_url || null,
        kyc_status: cp?.kyc_status || 'verified',
      })
    } catch {
      // Fallback from user metadata
      setProfile({
        id: u.id,
        full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Member',
        email: u.email,
        phone: u.user_metadata?.phone || null,
        role: (u.user_metadata?.role as any) || 'buyer',
        company_name: u.user_metadata?.company_name || null,
        kyc_status: 'verified',
      })
    }
  }

  useEffect(() => {
    let mounted = true

    // Safety timeout: loading state must never hang permanently
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 1000)

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!mounted) return
        if (error) {
          setLoading(false)
          return
        }
        setSession(data.session)
        const u = data.session?.user ?? null
        setUser(u)
        if (u) {
          await loadProfileForUser(u)
        }
      } catch (e) {
        console.warn('[AuthProvider] getSession error:', e)
      } finally {
        if (mounted) {
          clearTimeout(timeout)
          setLoading(false)
        }
      }
    }

    initAuth()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return
      setSession(s)
      const u = s?.user ?? null
      setUser(u)
      if (u) {
        await loadProfileForUser(u)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      sub.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch {}
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfileForUser(user)
    }
  }

  return (
    <Ctx.Provider value={{ user, profile, session, loading, signOut, refreshProfile }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  return useContext(Ctx)
}
