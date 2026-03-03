"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Star, CheckCircle } from "lucide-react"
import { getImageUrl, type BusinessDetailApi } from "@/lib/api"

const DEFAULT_COVER = "/placeholder.jpg"

export function CoverHero({ business }: { business: BusinessDetailApi }) {
  const resolved = getImageUrl(business.image_url) || DEFAULT_COVER
  const [imageUrl, setImageUrl] = useState(resolved)
  const rating = business.rating ?? 0

  return (
    <section className="relative h-72 w-full overflow-hidden md:h-80 lg:h-96">
      <Image
        src={imageUrl}
        alt={`${business.name} - Portada`}
        fill
        className="object-cover"
        priority
        unoptimized={imageUrl.startsWith("http") || imageUrl.includes("/uploads/")}
        onError={() => setImageUrl(DEFAULT_COVER)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {business.category && (
                  <Badge className="bg-accent text-accent-foreground text-xs font-semibold">
                    {business.category}
                  </Badge>
                )}
                <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground text-xs">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Verificado
                </Badge>
              </div>
              <h1 className="text-balance text-2xl font-bold tracking-tight text-primary-foreground md:text-3xl lg:text-4xl">
                {business.name}
              </h1>
              <p className="text-sm text-primary-foreground/80 md:text-base">
                {business.city}
                {business.location ? ` · ${business.location}` : ""}
              </p>
            </div>
            {rating > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-card/20 px-3 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={
                        star <= Math.round(rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-amber-400/40 text-amber-400/40"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-primary-foreground">{rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
