import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section id="publicar" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-primary">
          <div className="flex flex-col items-center gap-8 px-6 py-16 text-center md:px-16 lg:py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/10">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>

            <div>
              <h2 className="text-balance font-[family-name:var(--font-heading)] text-3xl font-bold text-primary-foreground md:text-4xl">
                Publicá tu negocio hoy
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-pretty text-primary-foreground/80 leading-relaxed">
                Llegá a miles de usuarios que buscan negocios como el tuyo en Paraguay.
                Registrate y empezá a recibir clientes.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="cursor-pointer gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/contacto">
                  Comenzar hoy
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="cursor-pointer border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link href="/contacto">Conocer más</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
