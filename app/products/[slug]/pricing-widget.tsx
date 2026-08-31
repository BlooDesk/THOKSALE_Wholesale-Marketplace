'use client'

import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus, TrendingDown, Sparkles, CheckCircle2, AlertTriangle, ShoppingCart } from 'lucide-react'
import {
  PRICING_TIERS, computePrice, buildPricingTable, formatCurrency, validateQuantity,
  type Tier,
} from '@/lib/pricing'
import { quoteProduct } from '@/app/actions/pricing'
import { addToCart } from '@/app/actions/cart'

type Props = {
  productId: string
  basePrice: number
  currency: string
  moq: number
  stock: number
  unit: string
}

export function PricingWidget({ productId, basePrice, currency, moq, stock, unit }: Props) {
  const router = useRouter()
  const [qty, setQty] = useState<number>(Math.max(moq, PRICING_TIERS[0].minQty))
  const [serverOk, setServerOk] = useState<null | boolean>(null)
  const [pending, start] = useTransition()
  const [addingToCart, startAdd] = useTransition()

  const validation = useMemo(
    () => validateQuantity(qty, { basePrice, moq, stock, currency }),
    [qty, basePrice, moq, stock, currency]
  )
  const quote = validation.ok ? validation.quote : computePrice(basePrice, Math.max(1, qty), currency)
  const table = useMemo(() => buildPricingTable(basePrice, currency), [basePrice, currency])

  function bump(delta: number) {
    setQty((q) => Math.max(1, q + delta))
    setServerOk(null)
  }

  function onQtyChange(v: string) {
    const n = parseInt(v || '0', 10)
    setQty(Number.isFinite(n) ? Math.max(0, n) : 0)
    setServerOk(null)
  }

  function verifyOnServer() {
    start(async () => {
      const res = await quoteProduct(productId, qty)
      if (!res.ok) {
        setServerOk(false)
        toast.error(res.error)
        return
      }
      setServerOk(true)
      toast.success(`Quote confirmed — ${formatCurrency(res.quote.total, res.quote.currency)}`)
    })
  }

  const tier = quote.tier
  const isBelowMOQ = qty < moq
  const isAboveStock = qty > stock

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Factory Price</div>
          <div className="text-sm font-medium text-muted-foreground line-through">
            {formatCurrency(basePrice, currency)}
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span className="text-4xl font-bold tracking-tight text-foreground">{formatCurrency(quote.unitPrice, currency)}</span>
          <span className="text-sm text-muted-foreground">per {unit}</span>
          <TierPill tier={tier} />
        </div>

        {quote.perUnitSavingsVsTier1 > 0 && (
          <div className="mt-3 flex items-center gap-1.5 rounded-2xl bg-success/10 px-3 py-2 text-sm font-medium [color:hsl(var(--success))]">
            <TrendingDown className="h-4 w-4" />
            You save {formatCurrency(quote.perUnitSavingsVsTier1, currency)} per {unit}
            {qty >= moq && !isAboveStock && (
              <span> · Total saved {formatCurrency(quote.totalSavingsVsTier1, currency)}</span>
            )}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Select quantity</label>
            <span className="text-xs text-muted-foreground">MOQ {moq} · Stock {stock.toLocaleString()} {unit}</span>
          </div>
          <div className="flex items-stretch overflow-hidden rounded-2xl border border-border bg-card">
            <button type="button" onClick={() => bump(-10)} disabled={qty <= 1} className="px-4 hover:bg-secondary disabled:opacity-40 transition-colors" aria-label="decrease 10">
              <Minus className="h-4 w-4" />
            </button>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={qty}
              onChange={(e) => onQtyChange(e.target.value)}
              className="h-12 w-full border-0 rounded-none text-center text-lg font-semibold shadow-none focus-visible:ring-0 focus-visible:border-transparent"
            />
            <button type="button" onClick={() => bump(10)} className="px-4 hover:bg-secondary transition-colors" aria-label="increase 10">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[moq, 50, 100, 200, 500].filter((v, i, a) => a.indexOf(v) === i && v >= 1).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => { setQty(v); setServerOk(null) }}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${qty === v ? 'border-accent bg-accent/10 [color:hsl(var(--accent))]' : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'}`}
              >
                {v.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {isBelowMOQ && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-warning/10 p-3 text-xs [color:hsl(var(--warning))]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5" /> Minimum order is <b>{moq}</b> {unit}.
          </div>
        )}
        {isAboveStock && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-destructive/10 p-3 text-xs [color:hsl(var(--destructive))]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5" /> Only <b>{stock}</b> in stock.
          </div>
        )}

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Applied Tier</dt>
            <dd className="font-semibold text-foreground">{tier.label} <span className="text-muted-foreground">({tier.rangeLabel})</span></dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Selected Qty</dt>
            <dd className="font-semibold text-foreground">{qty.toLocaleString()} {unit}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Unit Price</dt>
            <dd className="font-semibold text-foreground">{formatCurrency(quote.unitPrice, currency)}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-baseline justify-between border-t border-border/60 pt-4">
          <div className="text-sm font-semibold text-foreground">Total</div>
          <div className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(quote.total, currency)}</div>
        </div>

        {quote.nextTier && quote.unitsToNextTier !== null && quote.unitsToNextTier > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-accent/10 p-3 text-xs text-foreground/85">
            <Sparkles className="h-3.5 w-3.5 [color:hsl(var(--accent))]" />
            Add <b>{quote.unitsToNextTier}</b> more {unit} to unlock <b>{quote.nextTier.label}</b> at {formatCurrency(basePrice * quote.nextTier.multiplier, currency)}/{unit}.
          </div>
        )}

        <div className="mt-5 space-y-2">
          <Button
            variant="accent"
            size="lg"
            className="w-full"
            disabled={addingToCart || !validation.ok}
            onClick={() => startAdd(async () => {
              const res = await addToCart(productId, qty)
              if (!res.ok) return toast.error(res.error)
              toast.success('Added to cart')
              router.push('/cart')
            })}
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            {addingToCart ? 'Adding…' : `Add ${qty} to cart`}
          </Button>
          <Button variant="outline" size="lg" className="w-full" disabled={pending || !validation.ok} onClick={verifyOnServer}>
            {pending ? 'Verifying…' : serverOk ? <><CheckCircle2 className="mr-2 h-4 w-4 [color:hsl(var(--success))]" /> Quote verified</> : 'Get verified quote'}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">Sign in as a buyer to add items to your cart.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Wholesale pricing</h3>
          <span className="text-xs text-muted-foreground">Base {formatCurrency(basePrice, currency)}</span>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Quantity</th>
                <th className="px-4 py-3 text-right font-semibold">Unit price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {table.map((row) => {
                const active = row.tier.id === tier.id
                return (
                  <tr key={row.tier.id} className={active ? 'bg-accent/8' : ''}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${active ? 'bg-accent' : 'bg-border'}`} />
                        <span className={active ? 'font-semibold text-foreground' : 'text-foreground/80'}>
                          {row.tier.rangeLabel}
                        </span>
                        {active && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">Active</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${active ? '[color:hsl(var(--accent))]' : 'text-foreground'}`}>
                        {formatCurrency(row.unitPrice, row.currency)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TierPill({ tier }: { tier: Tier }) {
  const colors: Record<number, string> = {
    1: 'bg-secondary text-foreground',
    2: 'bg-accent/12 [color:hsl(var(--accent))]',
    3: 'bg-success/12 [color:hsl(var(--success))]',
  }
  return (
    <span className={`ml-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${colors[tier.id]}`}>
      {tier.label}
    </span>
  )
}
