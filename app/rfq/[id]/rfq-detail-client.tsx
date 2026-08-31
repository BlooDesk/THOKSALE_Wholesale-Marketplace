'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Check, X, Send, XCircle } from 'lucide-react'
import { submitRfqResponse, acceptRfqResponse, rejectRfqResponse, closeRfq } from '@/app/actions/rfqs'

export function RfqResponseActions({ responseId }: { responseId: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="success" onClick={() => start(async () => {
        const res = await acceptRfqResponse(responseId)
        if (!res.ok) return toast.error(res.error)
        toast.success('Quote accepted'); router.refresh()
      })} disabled={pending}><Check className="mr-1 h-3.5 w-3.5" /> Accept</Button>
      <Button size="sm" variant="outline" onClick={() => start(async () => {
        const res = await rejectRfqResponse(responseId)
        if (!res.ok) return toast.error(res.error)
        toast.success('Rejected'); router.refresh()
      })} disabled={pending}><X className="mr-1 h-3.5 w-3.5" /> Reject</Button>
    </div>
  )
}

export function CloseRfqButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Button size="sm" variant="outline" onClick={() => start(async () => {
      const res = await closeRfq(id)
      if (!res.ok) return toast.error(res.error)
      toast.success('RFQ closed'); router.refresh()
    })} disabled={pending}><XCircle className="mr-1 h-3.5 w-3.5" /> Close RFQ</Button>
  )
}

export function SellerResponseForm({ rfqId, existing, currency, disabled }: { rfqId: string; existing?: any; currency: string; disabled?: boolean }) {
  const router = useRouter()
  const [price, setPrice] = useState<string>(existing?.quoted_price ? String(existing.quoted_price) : '')
  const [qty, setQty] = useState<string>(existing?.quantity_available ? String(existing.quantity_available) : '')
  const [days, setDays] = useState<string>(existing?.lead_time_days ? String(existing.lead_time_days) : '')
  const [terms, setTerms] = useState(existing?.payment_terms || 'Net 30')
  const [notes, setNotes] = useState(existing?.notes || '')
  const [pending, start] = useTransition()

  if (disabled && !existing) return null

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const p = parseFloat(price)
    if (!(p >= 0)) return toast.error('Enter a valid price')
    start(async () => {
      const res = await submitRfqResponse({
        rfqId, quoted_price: p,
        quantity_available: qty ? parseInt(qty, 10) : null,
        lead_time_days: days ? parseInt(days, 10) : null,
        payment_terms: terms, notes,
      })
      if (!res.ok) return toast.error(res.error)
      toast.success(existing ? 'Quote updated' : 'Quote submitted')
      router.refresh()
    })
  }

  const label = 'text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{existing ? 'Update your quote' : 'Submit a quote'}</span>
          {existing && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize text-muted-foreground">{existing.status}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {disabled ? (
          <p className="text-sm text-muted-foreground">This RFQ is no longer accepting responses.</p>
        ) : (
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2"><Label className={label}>Unit price ({currency})</Label><Input type="number" min={0} step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} /></div>
            <div className="space-y-2"><Label className={label}>Available quantity</Label><Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} /></div>
            <div className="space-y-2"><Label className={label}>Lead time (days)</Label><Input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} /></div>
            <div className="space-y-2"><Label className={label}>Payment terms</Label><Input value={terms} onChange={(e) => setTerms(e.target.value)} /></div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-4"><Label className={label}>Remarks</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end"><Button type="submit" variant="accent" size="default" disabled={pending}>{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}<Send className="mr-1 h-4 w-4" /> {existing ? 'Update' : 'Submit'}</Button></div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
