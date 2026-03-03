"use client"

import Image from "next/image"
import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { getImageUrl, type BusinessDetailApi } from "@/lib/api"

const PLACEHOLDER_IMG = "/placeholder.jpg"

export function PhotoGallery({ business }: { business: BusinessDetailApi }) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set())
  const rawImages = business.gallery_images?.length ? business.gallery_images : (business.image_url ? [business.image_url] : [])
  const images = rawImages.map((src) => getImageUrl(src) || src)

  function next() {
    if (lightbox !== null) setLightbox((lightbox + 1) % images.length)
  }
  function prev() {
    if (lightbox !== null) setLightbox((lightbox - 1 + images.length) % images.length)
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">Fotos del local</h2>
        {!images.length ? (
          <p className="rounded-xl border border-border bg-card p-4 text-sm italic text-muted-foreground">Aún no hay fotos del local.</p>
        ) : (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setLightbox(i)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <Image
                src={failedIndices.has(i) ? PLACEHOLDER_IMG : src}
                alt={`${business.name} - Foto ${i + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
                onError={() => setFailedIndices((s) => new Set(s).add(i))}
              />
              <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
            </button>
          ))}
        </div>
        )}
      </div>

      {lightbox !== null && images.length > 0 && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-label="Visor de fotos"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 z-[10000] flex h-10 w-10 items-center justify-center rounded-full bg-card/20 text-primary-foreground transition-colors hover:bg-card/40"
            aria-label="Cerrar visor"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 z-[10000] flex h-10 w-10 items-center justify-center rounded-full bg-card/20 text-primary-foreground transition-colors hover:bg-card/40"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="relative z-[10000] h-[70vh] w-full max-w-4xl">
            <Image
              src={failedIndices.has(lightbox) ? PLACEHOLDER_IMG : images[lightbox]}
              alt={`${business.name} - Foto ${lightbox + 1}`}
              fill
              className="rounded-xl object-contain"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={next}
            className="absolute right-4 z-[10000] flex h-10 w-10 items-center justify-center rounded-full bg-card/20 text-primary-foreground transition-colors hover:bg-card/40"
            aria-label="Siguiente foto"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-6 z-[10000] flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(i)}
                className={`h-2 rounded-full transition-all ${
                  i === lightbox ? "w-6 bg-primary-foreground" : "w-2 bg-primary-foreground/40"
                }`}
                aria-label={`Ver foto ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
