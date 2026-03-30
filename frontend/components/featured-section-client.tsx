"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchFeatured, getImageUrl, type BusinessApi } from "@/lib/api"

const PLACEHOLDER_IMG = "/placeholder.svg"

export function FeaturedSectionClient() {
  const [featured, setFeatured] = useState<BusinessApi[]>([])
  const [loading, setLoading] = useState(true)
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(new Set())
  const carouselRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchFeatured()
      .then((list) => {
        if (!cancelled) setFeatured(Array.isArray(list) ? list : [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const el = carouselRef.current
    if (!el || featured.length <= 1) return

    const interval = window.setInterval(() => {
      const card = el.querySelector<HTMLElement>("[data-featured-card]")
      const step = card ? card.offsetWidth + 24 : Math.round(el.clientWidth * 0.85)
      const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth)
      const next = el.scrollLeft + step
      el.scrollTo({
        left: next >= maxScrollLeft ? 0 : next,
        behavior: "smooth",
      })
    }, 3500)

    return () => window.clearInterval(interval)
  }, [featured.length])

  return (
    <section id="destacados" className="bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-sm font-semibold tracking-wide text-accent uppercase">
              Destacados
            </span>
            <h2 className="mt-2 text-balance font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground md:text-4xl">
              Negocios recomendados
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-muted-foreground leading-relaxed">
              Los lugares mejor valorados por nuestra comunidad
            </p>
          </div>
          <Button variant="outline" asChild className="cursor-pointer gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Link href="/destacados">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div
          ref={carouselRef}
          className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {loading ? (
            <div className="flex w-full justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : featured.length === 0 ? (
            <p className="w-full py-8 text-center text-sm text-muted-foreground">
              Aún no hay negocios destacados. Los que marques como destacados al crear o editar aparecerán aquí.
            </p>
          ) : (
            featured.map((business) => (
              <Link
                key={business.id}
                href={`/negocio/${business.slug}`}
                data-featured-card
                className="group block w-[85vw] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 sm:w-[360px] lg:w-[320px]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={failedImageIds.has(business.id) ? PLACEHOLDER_IMG : (getImageUrl(business.image_url) || PLACEHOLDER_IMG)}
                    alt={business.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                    onError={() => setFailedImageIds((s) => new Set(s).add(business.id))}
                  />
                  {business.featured ? (
                    <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      Destacado
                    </span>
                  ) : null}
                </div>

                <div className="p-4">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-primary">
                    {business.category}
                  </span>

                  <h3 className="mt-2 font-[family-name:var(--font-heading)] text-base font-semibold text-card-foreground group-hover:text-accent transition-colors">
                    {business.name}
                  </h3>

                  {business.city?.trim() ? (
                    <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs">{business.city.trim()}</span>
                    </div>
                  ) : null}

                  <span className="mt-3 flex w-full items-center gap-1 text-sm text-accent group-hover:underline">
                    Ver más
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
