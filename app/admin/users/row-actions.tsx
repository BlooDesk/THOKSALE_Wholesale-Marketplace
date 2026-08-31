'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { toggleUserActive, verifySellerCompany, unverifySellerCompany } from '@/app/actions/admin'

export function UserRowActions({ userId, isActive, role, kycStatus }: { userId: string; isActive: boolean; role: string; kycStatus?: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => {
        const res = await toggleUserActive(userId)
        if (!res.ok) return toast.error(res.error); toast.success('Updated'); router.refresh()
      })} className={isActive ? '[color:hsl(var(--destructive))] border-destructive/30' : '[color:hsl(var(--success))] border-success/30'}>{isActive ? 'Suspend' : 'Reactivate'}</Button>
      {role === 'seller' && kycStatus !== 'verified' && (
        <Button size="sm" disabled={pending} onClick={() => start(async () => {
          const res = await verifySellerCompany(userId)
          if (!res.ok) return toast.error(res.error); toast.success('Seller verified'); router.refresh()
        })}>Verify</Button>
      )}
      {role === 'seller' && kycStatus === 'verified' && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => {
          const res = await unverifySellerCompany(userId)
          if (!res.ok) return toast.error(res.error); toast.success('KYC reset'); router.refresh()
        })}>Unverify</Button>
      )}
    </div>
  )
}
