'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Eyebrow } from '@/components/ui/eyebrow'
import {
  ShoppingBag, TrendingUp, Package, Users, Sparkles, ArrowRight, Check,
  Bell, Settings, Search, Plus, ChevronRight, Inbox
} from 'lucide-react'

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Subtle backdrop grid */}
      <div className="pointer-events-none fixed inset-0 bg-grid-subtle opacity-40" aria-hidden />

      <Container className="relative py-16 md:py-24 space-y-24">
        {/* Hero */}
        <PageHeader
          eyebrow="ThokSale Design System"
          title="A calm, premium foundation for wholesale."
          description="Manrope typography, 24px surfaces, a warm off-white canvas, deep slate ink, and a reserved gold accent. Built for enterprise clarity — inspired by Apple × Stripe."
          actions={
            <>
              <Button variant="outline" size="lg">
                <Search className="mr-1" /> Browse tokens
              </Button>
              <Button variant="accent" size="lg">
                Get started <ArrowRight />
              </Button>
            </>
          }
        />

        {/* Palette */}
        <section className="space-y-8">
          <SectionHeading eyebrow="01 · Palette" title="Color system" description="Warm neutrals, deep ink primary, gold accent for highlights, feedback greens & reds." />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Background', cls: 'bg-background border', hex: '#FAFAF8' },
              { name: 'Foreground', cls: 'bg-foreground', hex: '#0F172A' },
              { name: 'Primary', cls: 'bg-primary', hex: '#0F172A' },
              { name: 'Accent (Gold)', cls: 'bg-accent', hex: '#C8A14D' },
              { name: 'Success', cls: 'bg-success', hex: '#10B981' },
              { name: 'Destructive', cls: 'bg-destructive', hex: '#EF4444' },
              { name: 'Muted', cls: 'bg-muted border', hex: 'muted' },
              { name: 'Secondary', cls: 'bg-secondary border', hex: 'secondary' },
              { name: 'Card', cls: 'bg-card border', hex: 'card' },
              { name: 'Border', cls: 'bg-border', hex: 'border' },
              { name: 'Ring / Focus', cls: 'bg-ring', hex: 'ring' },
              { name: 'Warning', cls: 'bg-warning', hex: '#F59E0B' },
            ].map((t) => (
              <div key={t.name} className="rounded-3xl border border-border/60 bg-card p-3 shadow-soft">
                <div className={`h-16 w-full rounded-2xl ${t.cls}`} />
                <div className="pt-3">
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-8">
          <SectionHeading eyebrow="02 · Typography" title="Manrope, tuned for scale" description="Tight tracking on headings, comfortable line-height on body. Ligatures on." />
          <Card>
            <CardContent className="space-y-6">
              <div>
                <Eyebrow>Display XL · 72px</Eyebrow>
                <p className="text-display-xl">Wholesale, refined.</p>
              </div>
              <div>
                <Eyebrow>Display LG · 60px</Eyebrow>
                <p className="text-display-lg">Verified suppliers.</p>
              </div>
              <div>
                <Eyebrow>Display MD · 48px</Eyebrow>
                <p className="text-display-md">Priced with intent.</p>
              </div>
              <div>
                <Eyebrow>Heading H2 · display-2</Eyebrow>
                <h2 className="display-2">Buy in bulk. <span className="gold-underline">Confidently.</span></h2>
              </div>
              <div>
                <Eyebrow>Body / Lead</Eyebrow>
                <p className="lead max-w-2xl">A calm reading rhythm for long product descriptions, contracts, and specifications — with balanced text wrapping.</p>
              </div>
              <div>
                <Eyebrow>Body / Default</Eyebrow>
                <p className="text-sm text-muted-foreground max-w-2xl">Body copy uses Manrope 400 with -0.011em tracking for a refined feel across dashboards and marketplace pages.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section className="space-y-8">
          <SectionHeading eyebrow="03 · Buttons" title="Interactive primitives" description="Gentle lift on hover, gold focus ring, generous tap targets." />
          <Card>
            <CardContent className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <Button>Primary</Button>
                <Button variant="accent">Accent gold</Button>
                <Button variant="success">Success</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="subtle">Subtle</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link style</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra large</Button>
                <Button size="icon" variant="outline"><Plus /></Button>
                <Button size="icon-sm" variant="outline"><Bell /></Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button><Sparkles /> With icon</Button>
                <Button variant="accent">Continue <ArrowRight /></Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Forms */}
        <section className="space-y-8">
          <SectionHeading eyebrow="04 · Forms" title="Inputs & controls" description="Taller controls, softer radii, focus rings in accent gold." />
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Text inputs</CardTitle>
                <CardDescription>Try focusing an input to see the gold ring.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Company name" />
                <Input placeholder="Email address" type="email" />
                <Input placeholder="Disabled" disabled />
                <Textarea placeholder="Tell us about your requirement..." />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Pill-shaped, uppercase, subtle tinted backgrounds.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="accent">Verified</Badge>
                <Badge variant="success">In stock</Badge>
                <Badge variant="warning">Low stock</Badge>
                <Badge variant="destructive">Out of stock</Badge>
                <Badge variant="secondary">Draft</Badge>
                <Badge variant="outline">New</Badge>
                <Badge variant="muted">Archived</Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stat cards */}
        <section className="space-y-8">
          <SectionHeading eyebrow="05 · Dashboards" title="Stat cards" description="Compact, elevated summaries for admin & seller dashboards." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Revenue" value="₹18,42,000" delta="+12.4%" deltaTone="positive" icon={TrendingUp} hint="vs. last month" />
            <StatCard label="Orders" value="1,284" delta="+3.1%" deltaTone="positive" icon={ShoppingBag} hint="This quarter" />
            <StatCard label="Active SKUs" value="562" delta="-2 items" deltaTone="negative" icon={Package} hint="Inventory movement" />
            <StatCard label="Buyers" value="94" delta="steady" deltaTone="neutral" icon={Users} hint="Verified this week" />
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-8">
          <SectionHeading eyebrow="06 · Surfaces" title="Card patterns" description="24px radius, soft shadow, generous padding. The flagship surface." />
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-premium transition-shadow">
              <CardHeader>
                <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/12 [color:hsl(var(--accent))]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle>Verified suppliers</CardTitle>
                <CardDescription>Every seller is GST-verified with signed documentation.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="link" className="px-0">Learn more <ChevronRight className="ml-0" /></Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                  <Package className="h-5 w-5" />
                </div>
                <CardTitle>Dynamic pricing</CardTitle>
                <CardDescription>Quantity slabs, partner codes, and enterprise contracts — one engine.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" size="sm">See slabs</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                  <Check className="h-5 w-5" />
                </div>
                <CardTitle>Freight + fulfilment</CardTitle>
                <CardDescription>Quote, ship, and reconcile from a single operations console.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="accent" size="sm">Request quote</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Empty state */}
        <section className="space-y-8">
          <SectionHeading eyebrow="07 · Empty states" title="Guiding the next action" />
          <EmptyState
            icon={Inbox}
            title="No orders yet"
            description="Once buyers start placing wholesale orders, they'll appear here with full traceability."
            action={<Button variant="accent"><Plus /> Create first order</Button>}
          />
        </section>

        {/* Elevation & radius reference */}
        <section className="space-y-8">
          <SectionHeading eyebrow="08 · Elevation" title="Shadows & radii" description="Four levels of elevation. Two radii scales: 16px controls, 24px surfaces." />
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: 'shadow-soft', cls: 'shadow-soft' },
              { name: 'shadow-premium', cls: 'shadow-premium' },
              { name: 'shadow-soft-lg', cls: 'shadow-soft-lg' },
              { name: 'shadow-gold', cls: 'shadow-gold' },
            ].map((s) => (
              <div key={s.name} className={`rounded-3xl border border-border/60 bg-card p-6 ${s.cls}`}>
                <div className="text-sm font-semibold text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground pt-1">Rounded 3xl · 24px</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <section className="pt-8 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Design system v1 · Manrope · #FAFAF8 canvas · #0F172A ink · #C8A14D accent · 24px premium surfaces
          </p>
        </section>
      </Container>
    </div>
  )
}
