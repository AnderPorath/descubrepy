import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BenefitsSection } from "@/components/benefits-section"
import { ContactForm } from "@/components/contact-form"

export const metadata = {
  title: "Anunciate - DescubrePY",
  description: "Publicá tu negocio en DescubrePY y llegá a miles de clientes potenciales en Paraguay.",
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-800">
        <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:py-20 md:py-24">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            Llevá tu negocio al siguiente nivel
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            Más de 2.500 negocios ya confían en DescubrePY para conectar con nuevos clientes en todo Paraguay.
          </p>
        </div>
      </section>

      {/* Contenido: beneficios + formulario */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-14">
          <BenefitsSection />
          <div className="md:sticky md:top-24">
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
