import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DestacadosList } from "@/components/destacados-list"
import { Star } from "lucide-react"

export const metadata = {
  title: "Negocios destacados - DescubrePY",
  description: "Los mejores negocios recomendados por la comunidad en Paraguay.",
}

export default function DestacadosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-primary">
          <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/10 text-primary-foreground">
                <Star className="h-8 w-8" />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-primary-foreground md:text-4xl">
                  Negocios recomendados
                </h1>
                <p className="mt-2 text-base text-primary-foreground/70">
                  Los lugares mejor valorados por nuestra comunidad
                </p>
              </div>
            </div>
          </div>
        </section>

        <DestacadosList />
      </main>

      <Footer />
    </div>
  )
}
