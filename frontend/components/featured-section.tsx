import Image from "next/image"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchFeatured } from "@/lib/api"

export async function FeaturedSection() {
  let featured: Array<{
    id: number
    name: string
    category: string
    location: string
    rating: number
    image_url: string
    featured: number
  }> = []
  try {
    featured = await fetchFeatured()
  } catch {
    // Fallback: mostrar sección vacía o mensaje si el backend no está
  }

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

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              Aún no hay negocios destacados. Los que marques como destacados al crear o editar aparecerán aquí.
            </p>
          ) : null}
          {featured.map((business) => (
            <Link
              key={business.id}
              href={`/negocio/${business.slug}`}
              className="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={business.image_url || "/placeholder.svg"}
                  alt={business.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
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

                <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-xs">{business.location}</span>
                </div>

                <span className="mt-3 flex w-full items-center gap-1 text-sm text-accent group-hover:underline">
                  Ver más
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
