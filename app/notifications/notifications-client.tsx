'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CheckCheck, ShoppingBag, Truck, FileText, ShieldCheck, Bell } from 'lucide-react'
import { markAllNotificationsRead, markNotificationRead } from '@/app/actions/notifications'

const TYPE_ICONS: Record<string, any> = {
  order_created: ShoppingBag,
  order_status_update: ShoppingBag,
  freight_quote: Truck,
  rfq_new: FileText,
  rfq_response: FileText,
  kyc_status: ShieldCheck,
  partner_code_shared: Bell,
  system: Bell,
  payment_update: ShoppingBag,
}

function hrefFor(n: any): string {
  if (n.data?.order_id) return `/orders/${n.data.order_id}`
  if (n.data?.rfq_id) return `/rfq/${n.data.rfq_id}`
  return '/notifications'
}

export function NotificationRow({ n }: { n: any }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const Icon = TYPE_ICONS[n.type] || Bell
  const href = hrefFor(n)

  function open() {
    if (!n.is_read) {
      start(async () => {
        await markNotificationRead(n.id)
        router.push(href)
      })
    } else {
      router.push(href)
    }
  }

  return (
    <button type="button" onClick={open} disabled={pending}
      className={`flex w-full items-start gap-4 border-b border-border/60 p-5 text-left last:border-b-0 hover:bg-secondary/50 transition-colors ${!n.is_read ? 'bg-accent/[0.06]' : ''}`}>
      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${!n.is_read ? 'bg-accent/12 [color:hsl(var(--accent))]' : 'bg-secondary text-muted-foreground'}`}><Icon className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold text-foreground">{n.title}</div>
          <div className="shrink-0 text-[11px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
        </div>
        {n.body && <div className="mt-1 line-clamp-2 text-sm text-muted-foreground leading-relaxed">{n.body}</div>}
      </div>
      {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
    </button>
  )
}

export function MarkAllReadButton() {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Button size="sm" variant="outline" onClick={() => start(async () => {
      const res = await markAllNotificationsRead()
      if (!res.ok) return toast.error(res.error)
      toast.success('All caught up'); router.refresh()
    })} disabled={pending}>
      <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
    </Button>
  )
}
