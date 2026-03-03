import Link from "next/link"
import Image from "next/image"
import { MapPin, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getImageUrl, type BusinessApi } from "@/lib/api"

const DEFAULT_IMAGE = "/placeholder.jpg"

export function BusinessCard({ business }: { business: BusinessApi }) {
  const imageUrl = getImageUrl(business.image_url) || DEFAULT_IMAGE
  const rating = business.rating ?? 0
  const locationText = business.city?.trim()

  return (
    <Link href={`/negocio/${business.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={imageUrl}
            alt={business.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={imageUrl.startsWith("http") || imageUrl.startsWith("/")}
          />
          {business.featured ? (
            <div className="absolute top-3 left-3">
              <Badge className="bg-accent text-accent-foreground border-0 shadow-lg">
                Destacado
              </Badge>
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            {business.category ? (
              <Badge variant="secondary" className="bg-card/90 text-foreground backdrop-blur-sm border-0">
                {business.category}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold leading-tight text-foreground text-balance group-hover:text-primary transition-colors">
              {business.name}
            </h3>
            {rating > 0 ? (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-foreground">{rating}</span>
              </div>
            ) : null}
          </div>
          {locationText ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  )
}
