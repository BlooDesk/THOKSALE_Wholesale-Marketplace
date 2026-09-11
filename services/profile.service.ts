// ============================================================
// THOKSALE — Profile Service
// Business logic layer for user profiles & company profiles.
// ============================================================

import {
  fetchProfile,
  fetchCompanyProfile,
  fetchNotificationCount,
  fetchWalletBalance,
} from '@/repositories/profiles.repo'

export async function getMyProfile(userId: string) {
  const { data, error } = await fetchProfile(userId)
  if (error) throw new Error(error.message)
  return data
}

export async function getMyCompanyProfile(userId: string) {
  const { data, error } = await fetchCompanyProfile(userId)
  if (error) return null // Not all users have a company profile yet
  return data
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await fetchNotificationCount(userId)
  if (error) return 0
  return count ?? 0
}

export async function getWalletBalance(userId: string): Promise<number> {
  return fetchWalletBalance(userId)
}

/** Resolve display name from profile + company profile fallback chain */
export function resolveDisplayName(profile: any, company: any, userMetadata?: any): string {
  return (
    profile?.full_name ||
    userMetadata?.full_name ||
    company?.display_name ||
    company?.legal_name ||
    'Wholesale Member'
  )
}

/** Resolve business name */
export function resolveBusinessName(company: any, userMetadata?: any): string {
  return (
    company?.display_name ||
    company?.legal_name ||
    userMetadata?.company_name ||
    'Registered Business'
  )
}

/** KYC verification display info */
export function getKycBadge(status: string): { label: string; color: string } {
  const badges: Record<string, { label: string; color: string }> = {
    verified: { label: 'KYC Verified', color: 'emerald' },
    submitted: { label: 'Under Review', color: 'amber' },
    pending: { label: 'Pending KYC', color: 'slate' },
    rejected: { label: 'KYC Rejected', color: 'red' },
  }
  return badges[status] ?? { label: 'Not Verified', color: 'slate' }
}
