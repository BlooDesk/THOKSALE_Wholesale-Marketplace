'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Upload, Loader2, Save, Trash2, ImageIcon, Globe, MapPin, Phone } from 'lucide-react'
import { updateCompanyProfile, deleteLogo, type CompanyInput } from '@/app/actions/company'

type Company = any

const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited',
  'Public Limited',
  'Individual',
  'Other',
]

export function CompanyProfileForm({
  initial,
  userEmail,
}: {
  initial: Company | null
  userEmail: string
}) {
  const [form, setForm] = useState<CompanyInput>({
    legal_name: initial?.legal_name || '',
    display_name: initial?.display_name || '',
    tax_id: initial?.tax_id || '',
    registration_number: initial?.registration_number || '',
    business_type: initial?.business_type || '',
    website: initial?.website || '',
    description: initial?.description || '',
    address_line1: initial?.address_line1 || '',
    address_line2: initial?.address_line2 || '',
    city: initial?.city || '',
    state: initial?.state || '',
    postal_code: initial?.postal_code || '',
    country: initial?.country || 'India',
    contact_email: initial?.contact_email || userEmail,
    contact_phone: initial?.contact_phone || '',
    logo_url: initial?.logo_url || null,
  })
  const [pending, start] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [kycStatus] = useState<string>(initial?.kyc_status || 'pending')
  const [updatedAt, setUpdatedAt] = useState<string | null>(initial?.updated_at || null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [dirty, setDirty] = useState(false)
  useEffect(() => { setDirty(true) }, [form])
  useEffect(() => { setDirty(false) }, []) // reset initial mount

  function set<K extends keyof CompanyInput>(k: K, v: CompanyInput[K]) {
    setForm((s) => ({ ...s, [k]: v }))
  }

  async function onUpload(file: File) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Logo must be under 5MB.')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/seller/upload-logo', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      set('logo_url', json.url)
      toast.success('Logo uploaded')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setUploading(false)
    }
  }

  async function onRemoveLogo() {
    start(async () => {
      const res = await deleteLogo()
      if (!res.ok) return toast.error(res.error)
      set('logo_url', null)
      toast.success('Logo removed')
    })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      const res = await updateCompanyProfile(form)
      if (!res.ok) return toast.error(res.error)
      setUpdatedAt(new Date().toISOString())
      setDirty(false)
      toast.success('Company profile saved')
    })
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* KYC status banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/12"><Building2 className="h-5 w-5 [color:hsl(var(--accent))]" /></span>
          <div>
            <div className="text-sm font-semibold text-foreground">KYC status</div>
            <div className="text-xs text-muted-foreground">Complete your profile to get verified faster.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={kycStatus === 'verified' ? 'success' : 'secondary'} className="capitalize">{kycStatus}</Badge>
          {updatedAt && (<span className="hidden text-xs text-muted-foreground sm:inline">Updated {new Date(updatedAt).toLocaleString()}</span>)}
        </div>
      </div>

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Company Logo</CardTitle>
          <CardDescription>PNG, JPG, WebP or SVG. Max 5MB. Recommended 512×512.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border/70 bg-muted">
              {form.logo_url ? (
                <Image src={form.logo_url} alt="logo" width={96} height={96} className="h-full w-full object-cover" unoptimized />
              ) : (
                <Building2 className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
              />
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {form.logo_url ? 'Replace logo' : 'Upload logo'}
              </Button>
              {form.logo_url && (
                <Button type="button" variant="ghost" onClick={onRemoveLogo} disabled={pending} className="[color:hsl(var(--destructive))]">
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Legal details that appear on invoices.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="legal_name">Legal Company Name <span className="text-red-500">*</span></Label>
            <Input id="legal_name" value={form.legal_name} onChange={(e) => set('legal_name', e.target.value)} required minLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input id="display_name" value={form.display_name || ''} onChange={(e) => set('display_name', e.target.value)} placeholder="Public storefront name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_type">Business Type</Label>
            <Select value={form.business_type || ''} onValueChange={(v) => set('business_type', v)}>
              <SelectTrigger id="business_type"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_id">GST Number</Label>
            <Input id="tax_id" value={form.tax_id || ''} onChange={(e) => set('tax_id', e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration_number">Registration Number</Label>
            <Input id="registration_number" value={form.registration_number || ''} onChange={(e) => set('registration_number', e.target.value)} placeholder="CIN / registration no." />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="website"><Globe className="mr-1 inline h-3 w-3" /> Website</Label>
            <Input id="website" type="url" value={form.website || ''} onChange={(e) => set('website', e.target.value)} placeholder="https://example.com" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Tell buyers about your company, products, and expertise…" />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Registered Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input id="address_line1" value={form.address_line1 || ''} onChange={(e) => set('address_line1', e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input id="address_line2" value={form.address_line2 || ''} onChange={(e) => set('address_line2', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city || ''} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" value={form.state || ''} onChange={(e) => set('state', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input id="postal_code" value={form.postal_code || ''} onChange={(e) => set('postal_code', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={form.country || ''} onChange={(e) => set('country', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input id="contact_email" type="email" value={form.contact_email || ''} onChange={(e) => set('contact_email', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input id="contact_phone" type="tel" value={form.contact_phone || ''} onChange={(e) => set('contact_phone', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Sticky footer */}
      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-3xl sm:border sm:px-6">
        <div className="text-xs text-slate-500">
          {dirty ? 'You have unsaved changes.' : updatedAt ? `Saved • updated ${new Date(updatedAt).toLocaleTimeString()}` : ' '}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending || uploading}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save changes
          </Button>
        </div>
      </div>
    </form>
  )
}
