import Link from 'next/link'
import Image from 'next/image'
import { ImageOff, ShieldCheck } from 'lucide-react'

export type CardProduct = {
  id: string
  name: string
  slug: string | null
  base_price: number
  currency: string
  moq: number
  unit: string
  product_images?: Array<{ url: string; is_primary: boolean }>
  categories?: { name: string; slug: string } | null
  seller?: {
    company_profiles?: { display_name: string | null; legal_name: string; city: string | null; state: string | null; logo_url: string | null } | null
  } | null
}

export function ProductCard({ product, priority = false }: { product: CardProduct, priority?: boolean }) {
  const img = (product.product_images || []).find((i) => i.is_primary)?.url ||
              (product.product_images || [])[0]?.url
  const cp = product.seller?.company_profiles
  const sellerName = cp?.display_name || cp?.legal_name || 'Verified seller'
  const location = [cp?.city, cp?.state].filter(Boolean).join(', ')

  return (
    <Link
      href={`/products/${product.slug || product.id}`}
      prefetch={false}
      className="group block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <article className="h-full overflow-hidden rounded-[24px] bg-card p-2 sm:p-2.5 border border-border/40 hover:border-accent/40 shadow-sm hover:shadow-lg transition-all duration-300 ease-premium hover:-translate-y-1">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-muted">
          {img ? (
            <Image
              src={img}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 48vw"
              className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.05] motion-reduce:transition-none"
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-8 w-8" aria-hidden />
            </div>
          )}
          {product.categories?.name && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-black/75 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-accent backdrop-blur-md">
              {product.categories.name}
            </span>
          )}
        </div>

        <div className="pt-3 px-1.5 pb-1">
          {/* Brand/Seller */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-accent uppercase tracking-wider mb-1">
            <span className="truncate">{sellerName}</span>
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={2.5} aria-hidden />
          </div>

          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-foreground/95 group-hover:text-accent transition-colors">
            {product.name}
          </h3>

          <div className="mt-3.5 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Starts at</div>
              <div className="mt-0.5 text-base sm:text-lg font-black tracking-tight text-foreground num truncate">
                {product.currency} {Number(product.base_price).toLocaleString('en-IN')}
                <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">/{product.unit}</span>
              </div>
            </div>
            <span className="num shrink-0 inline-flex items-baseline gap-1 rounded-full bg-[#FAFAF8] dark:bg-zinc-800 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-foreground/80 border border-border/40">
              MOQ <span className="text-accent">{product.moq}</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export const PRODUCT_CARD_SELECT = `
  id, name, slug, base_price, currency, moq, unit,
  product_images ( url, is_primary ),
  categories:category_id ( name, slug ),
  seller:profiles!seller_id (
    id,
    company_profiles!company_profiles_profile_id_fkey ( display_name, legal_name, city, state, logo_url )
  )
`.replace(/\s+/g, ' ')
