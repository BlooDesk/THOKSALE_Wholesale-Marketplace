'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Truck, Check, X, Loader2, Clock } from 'lucide-react'
import { submitFreightQuote, acceptFreightQuote, rejectFreightQuote, requestFreightQuote } from '@/app/actions/freight'
import { formatCurrency } from '@/lib/pricing'

type Props = {
  orderId: string
  status: string
  currency: string
  isSeller: boolean
  isBuyer: boolean
  freightQuote: any | null
}

export function FreightCard({ orderId, status, currency, isSeller, isBuyer, freightQuote }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState<string>('')
  const [days, setDays] = useState<string>('')
  const [carrier, setCarrier] = useState('')
  const [notes, setNotes] = useState('')
  const [validDays, setValidDays] = useState('7')

  const canSellerAskForFreight = isSeller && status === 'accepted'
  const canSellerSubmit = isSeller && ['accepted', 'awaiting_freight_quote'].includes(status)
  const canBuyerAct = isBuyer && status === 'freight_quote_sent' && !!freightQuote

  if (!canSellerAskForFreight && !canSellerSubmit && !canBuyerAct && !freightQuote) return null

  function seek() {
    start(async () => {
      const res = await requestFreightQuote(orderId)
      if (!res.ok) return toast.error(res.error)
      toast.success('Order marked “Awaiting Freight Quote”')
      router.refresh()
    })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!(amt >= 0)) return toast.error('Enter a valid amount')
    start(async () => {
      const res = await submitFreightQuote({
        orderId, quoted_amount: amt, transit_days: days ? parseInt(days, 10) : undefined,
        carrier: carrier || undefined, notes: notes || undefined,
        valid_days: validDays ? parseInt(validDays, 10) : undefined,
      })
      if (!res.ok) return toast.error(res.error)
      toast.success('Freight quote sent to buyer')
      setShowForm(false); router.refresh()
    })
  }

  function accept() {
    start(async () => {
      const res = await acceptFreightQuote(orderId)
      if (!res.ok) return toast.error(res.error)
      toast.success('Freight quote accepted'); router.refresh()
    })
  }

  function reject() {
    start(async () => {
      const res = await rejectFreightQuote(orderId)
      if (!res.ok) return toast.error(res.error)
      toast.success('Freight quote rejected — seller can re-quote.'); router.refresh()
    })
  }

  const label = 'text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'

  return (
    <section className="mt-6 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Truck className="h-4 w-4 [color:hsl(var(--accent))]" /> Freight</div>

      {freightQuote && (
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div><dt className={label}>Amount</dt><dd className="mt-1 font-semibold text-foreground">{formatCurrency(Number(freightQuote.quoted_amount), currency)}</dd></div>
          <div><dt className={label}>Transit</dt><dd className="mt-1 font-semibold text-foreground">{freightQuote.transit_days ? `${freightQuote.transit_days} days` : '—'}</dd></div>
          <div><dt className={label}>Carrier</dt><dd className="mt-1 font-semibold text-foreground">{freightQuote.carrier || '—'}</dd></div>
          <div><dt className={label}>Valid until</dt><dd className="mt-1 font-semibold text-foreground">{freightQuote.valid_until ? new Date(freightQuote.valid_until).toLocaleDateString() : '—'}</dd></div>
          {freightQuote.provider_payload?.notes && <div className="sm:col-span-4 text-xs text-muted-foreground">Notes: {freightQuote.provider_payload.notes}</div>}
        </dl>
      )}

      {canBuyerAct && (
        <div className="mt-5 flex gap-2">
          <Button size="default" variant="success" onClick={accept} disabled={pending}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Accept freight</Button>
          <Button size="default" variant="outline" onClick={reject} disabled={pending}><X className="h-4 w-4" /> Reject</Button>
        </div>
      )}

      {canSellerAskForFreight && !showForm && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="default" variant="accent" onClick={() => setShowForm(true)}><Truck className="mr-1 h-4 w-4" /> Enter freight quote</Button>
          <Button size="default" variant="outline" onClick={seek} disabled={pending}><Clock className="mr-1 h-4 w-4" /> Mark as awaiting</Button>
        </div>
      )}

      {canSellerSubmit && (showForm || status === 'awaiting_freight_quote') && (
        <form onSubmit={submit} className="mt-5 grid gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2"><Label className={label}>Amount ({currency})</Label><Input type="number" min={0} step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div className="space-y-2"><Label className={label}>Transit days</Label><Input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} /></div>
          <div className="space-y-2"><Label className={label}>Carrier</Label><Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="BlueDart, DTDC…" /></div>
          <div className="space-y-2"><Label className={label}>Quote valid (days)</Label><Input type="number" min={1} value={validDays} onChange={(e) => setValidDays(e.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2 lg:col-span-4"><Label className={label}>Delivery notes</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2">
            <Button type="submit" variant="accent" size="default" disabled={pending}>{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send quote to buyer</Button>
          </div>
        </form>
      )}
    </section>
  )
}
