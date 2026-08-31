'use server'

import { revalidatePath } from 'next/cache'
import { requireSeller } from '@/lib/auth-helpers'
import type { Result } from '@/lib/auth-helpers'

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived'

export type ProductInput = {
  id: string             // pre-generated UUID (used for image folder path)
  name: string
  sku?: string | null
  category_id?: string | null
  industry_id?: string | null
  subcategory_id?: string | null
  brand_id?: string | null
  packaging_unit_id?: string | null
  measurement_unit_id?: string | null
  description?: string | null
  base_price: number
  moq: number
  stock_quantity: number
  unit: string
  status: ProductStatus
  currency?: string
  brand?: string | null
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}

function validate(input: ProductInput): string | null {
  if (!input.id) return 'Missing product id.'
  if (!input.name || input.name.trim().length < 2) return 'Product name is required (min 2 chars).'
  if (input.name.length > 200) return 'Product name too long (max 200 chars).'
  if (isNaN(input.base_price) || input.base_price < 0) return 'Base price must be a non-negative number.'
  if (!Number.isInteger(input.moq) || input.moq < 1) return 'MOQ must be an integer ≥ 1.'
  if (!Number.isInteger(input.stock_quantity) || input.stock_quantity < 0) return 'Stock quantity must be an integer ≥ 0.'
  if (!input.unit) return 'Unit is required.'
  if (!['draft', 'active', 'inactive', 'archived'].includes(input.status)) return 'Invalid status.'
  return null
}

export async function createProduct(input: ProductInput, imageUrls: string[] = []): Promise<Result<{ id: string }>> {
  const ctx = await requireSeller()
  if (!ctx.ok) return { ok: false, error: ctx.error === 'unauthenticated' ? 'Not authenticated' : 'Only sellers can create products' }
  const err = validate(input)
  if (err) return { ok: false, error: err }

  const slug = `${slugify(input.name)}-${input.id.slice(0, 6)}`

  const { error } = await ctx.admin.from('products').insert({
    id: input.id,
    seller_id: ctx.user.id,
    category_id: input.category_id || null,
    industry_id: input.industry_id || null,
    subcategory_id: input.subcategory_id || null,
    brand_id: input.brand_id || null,
    packaging_unit_id: input.packaging_unit_id || null,
    measurement_unit_id: input.measurement_unit_id || null,
    sku: input.sku?.trim() || null,
    name: input.name.trim(),
    slug,
    description: input.description?.trim() || null,
    brand: input.brand?.trim() || null,
    unit: input.unit,
    moq: input.moq,
    base_price: input.base_price,
    currency: input.currency || 'INR',
    stock_quantity: input.stock_quantity,
    status: input.status,
  })

  if (error) return { ok: false, error: error.message }

  // Attach any pre-uploaded images
  if (imageUrls.length > 0) {
    const rows = imageUrls.map((url, i) => ({
      product_id: input.id,
      url,
      is_primary: i === 0,
      sort_order: i,
    }))
    await ctx.admin.from('product_images').insert(rows)
  }

  revalidatePath('/seller/products')
  return { ok: true, data: { id: input.id } }
}

export async function updateProduct(input: ProductInput): Promise<Result> {
  const ctx = await requireSeller()
  if (!ctx.ok) return { ok: false, error: 'Only sellers can update products' }
  const err = validate(input)
  if (err) return { ok: false, error: err }

  // Ownership check
  const { data: existing } = await ctx.admin
    .from('products').select('seller_id, deleted_at').eq('id', input.id).maybeSingle()
  if (!existing) return { ok: false, error: 'Product not found' }
  if (existing.seller_id !== ctx.user.id) return { ok: false, error: 'Not your product' }

  const { error } = await ctx.admin.from('products').update({
    category_id: input.category_id || null,
    industry_id: input.industry_id || null,
    subcategory_id: input.subcategory_id || null,
    brand_id: input.brand_id || null,
    packaging_unit_id: input.packaging_unit_id || null,
    measurement_unit_id: input.measurement_unit_id || null,
    sku: input.sku?.trim() || null,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    brand: input.brand?.trim() || null,
    unit: input.unit,
    moq: input.moq,
    base_price: input.base_price,
    stock_quantity: input.stock_quantity,
    status: input.status,
  }).eq('id', input.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/seller/products')
  revalidatePath(`/seller/products/${input.id}/edit`)
  return { ok: true }
}

export async function deleteProduct(id: string): Promise<Result> {
  const ctx = await requireSeller()
  if (!ctx.ok) return { ok: false, error: 'Only sellers can delete products' }

  const { data: existing } = await ctx.admin
    .from('products').select('seller_id').eq('id', id).maybeSingle()
  if (!existing) return { ok: false, error: 'Product not found' }
  if (existing.seller_id !== ctx.user.id) return { ok: false, error: 'Not your product' }

  const { error } = await ctx.admin.from('products')
    .update({ deleted_at: new Date().toISOString(), status: 'archived' })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/seller/products')
  return { ok: true }
}

export async function attachProductImage(productId: string, url: string): Promise<Result<{ id: string }>> {
  const ctx = await requireSeller()
  if (!ctx.ok) return { ok: false, error: 'Only sellers can add images' }

  const { data: existing } = await ctx.admin
    .from('products').select('seller_id').eq('id', productId).maybeSingle()
  if (!existing) return { ok: false, error: 'Product not found' }
  if (existing.seller_id !== ctx.user.id) return { ok: false, error: 'Not your product' }

  const { count } = await ctx.admin
    .from('product_images')
    .select('id', { head: true, count: 'exact' })
    .eq('product_id', productId)

  const isFirst = (count ?? 0) === 0

  const { data, error } = await ctx.admin.from('product_images').insert({
    product_id: productId,
    url,
    is_primary: isFirst,
    sort_order: count ?? 0,
  }).select('id').single()

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/seller/products/${productId}/edit`)
  return { ok: true, data: { id: data.id } }
}

export async function deleteProductImage(imageId: string): Promise<Result> {
  const ctx = await requireSeller()
  if (!ctx.ok) return { ok: false, error: 'Only sellers can delete images' }

  const { data: img } = await ctx.admin
    .from('product_images')
    .select('id, url, product_id, products!inner(seller_id)')
    .eq('id', imageId).maybeSingle()
  if (!img) return { ok: false, error: 'Image not found' }
  // @ts-ignore
  if (img.products?.seller_id !== ctx.user.id) return { ok: false, error: 'Not your image' }

  // Remove from storage
  const marker = '/storage/v1/object/public/product-images/'
  const idx = img.url.indexOf(marker)
  if (idx > -1) {
    const path = img.url.slice(idx + marker.length)
    await ctx.admin.storage.from('product-images').remove([path]).catch(() => {})
  }

  await ctx.admin.from('product_images').delete().eq('id', imageId)

  // Ensure at least one image is primary
  const { data: remaining } = await ctx.admin
    .from('product_images')
    .select('id, is_primary')
    .eq('product_id', img.product_id)
    .order('sort_order', { ascending: true })
    .limit(1)
  if (remaining && remaining.length > 0 && !remaining[0].is_primary) {
    await ctx.admin.from('product_images').update({ is_primary: true }).eq('id', remaining[0].id)
  }

  revalidatePath(`/seller/products/${img.product_id}/edit`)
  return { ok: true }
}

export async function setPrimaryImage(imageId: string): Promise<Result> {
  const ctx = await requireSeller()
  if (!ctx.ok) return { ok: false, error: 'Only sellers can update images' }

  const { data: img } = await ctx.admin
    .from('product_images')
    .select('id, product_id, products!inner(seller_id)')
    .eq('id', imageId).maybeSingle()
  if (!img) return { ok: false, error: 'Image not found' }
  // @ts-ignore
  if (img.products?.seller_id !== ctx.user.id) return { ok: false, error: 'Not your image' }

  await ctx.admin.from('product_images').update({ is_primary: false }).eq('product_id', img.product_id)
  await ctx.admin.from('product_images').update({ is_primary: true }).eq('id', imageId)

  revalidatePath(`/seller/products/${img.product_id}/edit`)
  return { ok: true }
}
