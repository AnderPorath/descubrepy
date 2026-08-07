"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Tag, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OpenStatusBadge } from "@/components/open-status-badge"
import { CouponRedeemDialog } from "@/components/coupon-redeem-dialog"
import { fetchDiscounts, getImageUrl, type BusinessApi } from "@/lib/api"
import { sortBusinessesByOpenStatus } from "@/lib/opening-hours"

const PLACEHOLDER_IMG = "/placeholder.svg"

export function DiscountSectionClient() {
  const [items, setItems] = useState<BusinessApi[]>([])
  const [loading, setLoading] = useState(true)
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(new Set())
  const [couponOpen, setCouponOpen] = useState(false)
  const [couponBusiness, setCouponBusiness] = useState<BusinessApi | null>(null)
  const carouselRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchDiscounts()
      .then((list) => {
        if (!cancelled) setItems(sortBusinessesByOpenStatus(Array.isArray(list) ? list : []))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const el = carouselRef.current
    if (!el || items.length <= 1) return
    const interval = window.setInterval(() => {
      const card = el.querySelector<HTMLElement>("[data-discount-card]")
      const step = card ? card.offsetWidth + 24 : Math.round(el.clientWidth * 0.85)
      const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth)
      const next = el.scrollLeft + step
      el.scrollTo({ left: next >= maxScrollLeft ? 0 : next, behavior: "smooth" })
    }, 3500)
    return () => window.clearInterval(interval)
  }, [items.length])

  return (
    <section id="descuentos" className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Descubre Descuentos
            </span>
            <h2 className="mt-2 text-balance font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground md:text-4xl">
              Locales con ofertas activas
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
              Aprovechá promociones exclusivas de negocios en todo Paraguay.
            </p>
          </div>
          <Button variant="outline" asChild className="cursor-pointer gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white">
            <Link href="/descuentos">
              Ver descuentos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div
          ref={carouselRef}
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {loading ? (
            <div className="flex w-full justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <p className="w-full py-8 text-center text-sm text-muted-foreground">
              Todavía no hay negocios con descuento.
            </p>
          ) : (
            items.map((business) => (
              <article
                key={business.id}
                data-discount-card
                className="group w-[85vw] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 sm:w-[360px] lg:w-[320px]"
              >
                <Link href={`/negocio/${business.slug}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={failedImageIds.has(business.id) ? PLACEHOLDER_IMG : (getImageUrl(business.image_url) || PLACEHOLDER_IMG)}
                      alt={business.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                      onError={() => setFailedImageIds((s) => new Set(s).add(business.id))}
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                      -{Number(business.discount_percent || 0)}%
                    </span>
                  </div>

                  <div className="p-4">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-primary">
                      {business.category}
                    </span>
                    <h3 className="mt-2 font-[family-name:var(--font-heading)] text-base font-semibold text-card-foreground transition-colors group-hover:text-emerald-600">
                      {business.name}
                    </h3>
                    <div className="mt-2">
                      <OpenStatusBadge
                        openingHours={business.opening_hours}
                        isOpen={business.is_open}
                        openLabel={business.open_label}
                        openDetail={business.open_detail}
                      />
                    </div>
                    {business.city?.trim() ? (
                      <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs">{business.city.trim()}</span>
                      </div>
                    ) : null}
                    <span className="mt-3 flex w-full items-center gap-1 text-sm text-emerald-700 group-hover:underline">
                      Ver oferta
                      <Tag className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <Button
                    type="button"
                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => {
                      setCouponBusiness(business)
                      setCouponOpen(true)
                    }}
                  >
                    Canjear
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
      <CouponRedeemDialog
        open={couponOpen}
        onOpenChange={setCouponOpen}
        businessName={couponBusiness?.name}
        couponUrl={couponBusiness?.discount_coupon_url}
        businessId={couponBusiness?.id}
        businessSlug={couponBusiness?.slug}
      />
    </section>
  )
}
