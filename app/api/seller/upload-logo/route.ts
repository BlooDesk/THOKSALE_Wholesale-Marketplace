import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'company-logos'
const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp']

async function ensureBucket() {
  const admin = createAdminClient()
  const { data: buckets } = await admin.storage.listBuckets()
  if (!buckets?.some((b) => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: ALLOWED,
    })
  }
}

export async function POST(request: NextRequest) {
  // Auth: must be seller
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'seller') {
    return NextResponse.json({ error: 'Only sellers can upload' }, { status: 403 })
  }

  const form = await request.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  try {
    await ensureBucket()
    const admin = createAdminClient()

    const ext = file.name.split('.').pop() || 'png'
    const path = `${user.id}/${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true })
    if (upErr) throw upErr

    // Delete old logo if any
    const { data: existing } = await admin
      .from('company_profiles').select('logo_url').eq('profile_id', user.id).maybeSingle()
    if (existing?.logo_url) {
      const marker = `/storage/v1/object/public/${BUCKET}/`
      const idx = existing.logo_url.indexOf(marker)
      if (idx > -1) {
        const oldPath = existing.logo_url.slice(idx + marker.length)
        if (oldPath !== path) {
          await admin.storage.from(BUCKET).remove([oldPath]).catch(() => {})
        }
      }
    }

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)
    return NextResponse.json({ url: pub.publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}
