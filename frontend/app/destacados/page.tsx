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
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
            <div className="flex flex-wrap items-center gap-4 md:gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10 text-primary-foreground md:h-14 md:w-14 md:rounded-2xl">
                <Star className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <div className="min-w-0 text-left">
                <h1 className="font-serif text-2xl font-bold text-primary-foreground md:text-3xl">
                  Negocios recomendados
                </h1>
                <p className="mt-1 text-sm text-primary-foreground/70 md:text-base">
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
