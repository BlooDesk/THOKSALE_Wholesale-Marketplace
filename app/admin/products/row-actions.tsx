'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { moderateProduct } from '@/app/actions/admin'

export function ProductRowActions({ id, status, isFeatured }: { id: string; status: string; isFeatured: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  function run(a: 'approve' | 'reject' | 'feature' | 'unfeature' | 'archive') {
    start(async () => {
      const res = await moderateProduct(id, a)
      if (!res.ok) return toast.error(res.error)
      toast.success('Updated'); router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap gap-1">
      {status !== 'active' && <Button size="sm" variant="outline" onClick={() => run('approve')} disabled={pending}>Approve</Button>}
      {status === 'active' && <Button size="sm" variant="outline" onClick={() => run('reject')} disabled={pending} className="text-amber-700 border-amber-300">Reject</Button>}
      <Button size="sm" variant="outline" onClick={() => run(isFeatured ? 'unfeature' : 'feature')} disabled={pending}>{isFeatured ? 'Unfeature' : 'Feature'}</Button>
      <Button size="sm" variant="ghost" onClick={() => run('archive')} disabled={pending} className="[color:hsl(var(--destructive))]">Archive</Button>
    </div>
  )
}
