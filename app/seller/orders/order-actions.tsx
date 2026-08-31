'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { transitionOrder } from '@/app/actions/orders'
import { sellerNextStatuses, buyerNextStatuses, STATUS_LABELS, type OrderStatus } from '@/lib/commerce'

export function OrderStatusActions({ orderId, status, isSeller, isBuyer }: { orderId: string; status: OrderStatus; isSeller: boolean; isBuyer: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [confirmNext, setConfirmNext] = useState<OrderStatus | null>(null)

  const opts = isSeller ? sellerNextStatuses(status) : isBuyer ? buyerNextStatuses(status) : []
  if (opts.length === 0) return null

  function act(next: OrderStatus) {
    start(async () => {
      const res = await transitionOrder(orderId, next)
      if (!res.ok) return toast.error(res.error)
      toast.success(`Order moved to “${STATUS_LABELS[next]}”`)
      setConfirmNext(null)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((s) => {
        const destructive = s === 'cancelled' || s === 'rejected'
        return (
          <Button
            key={s}
            size="default"
            variant={destructive ? 'outline' : (s === 'accepted' ? 'accent' : 'default')}
            onClick={() => destructive ? setConfirmNext(s) : act(s)}
            disabled={pending}
          >
            {pending && confirmNext === null ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
              destructive ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            {s === 'accepted' && isSeller ? 'Accept order' : STATUS_LABELS[s]}
          </Button>
        )
      })}

      <AlertDialog open={confirmNext !== null} onOpenChange={(o) => !o && setConfirmNext(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {confirmNext && STATUS_LABELS[confirmNext]}</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Back</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmNext && act(confirmNext)} disabled={pending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
