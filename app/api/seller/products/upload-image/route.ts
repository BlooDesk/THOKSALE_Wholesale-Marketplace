import { NextRequest, NextResponse } from 'next/server'
import { requireSeller } from '@/lib/auth-helpers'

const BUCKET = 'product-images'
const MAX_BYTES = 8 * 1024 * 1024 // 8MB per image
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp']

async function ensureBucket(admin: any) {
  const { data: buckets } = await admin.storage.listBuckets()
  if (!buckets?.some((b: any) => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: ALLOWED,
    })
  }
}

export async function POST(request: NextRequest) {
  const ctx = await requireSeller()
  if (!ctx.ok) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.error === 'unauthenticated' ? 401 : 403 })
  }

  const form = await request.formData()
  const file = form.get('file') as File | null
  const productId = String(form.get('product_id') || '')
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!productId) return NextResponse.json({ error: 'Missing product_id' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 8MB)' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Only PNG, JPG or WebP allowed' }, { status: 400 })

  try {
    await ensureBucket(ctx.admin)
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
    const path = `${ctx.user.id}/${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: upErr } = await ctx.admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false })
    if (upErr) throw upErr

    const { data: pub } = ctx.admin.storage.from(BUCKET).getPublicUrl(path)
    return NextResponse.json({ url: pub.publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}
