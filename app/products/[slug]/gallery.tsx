'use client'

import { useState } from 'react'
import { ImageOff } from 'lucide-react'

export function ProductGallery({
  images,
  title,
}: {
  images: Array<{ id: string; url: string; is_primary: boolean }>
  title: string
}) {
  const [idx, setIdx] = useState(0)
  const list = images.length > 0 ? images : []
  const active = list[idx]

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-soft">
        {active ? (
          <img src={active.url} alt={title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-12 w-12" />
          </div>
        )}
      </div>
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {list.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIdx(i)}
              className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${i === idx ? 'border-accent shadow-ring-gold' : 'border-border/60 hover:border-border'}`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
