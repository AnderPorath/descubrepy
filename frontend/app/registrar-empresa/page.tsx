import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RegisterBusinessForm } from "@/components/register-business-form"
import { fetchCategoriesFresh, fetchCitiesFresh } from "@/lib/api"

export const metadata = {
  title: "Registrar empresa - DescubrePY",
  description: "Alta de empresas en DescubrePY (solo administradores).",
}

export default async function RegistrarEmpresaPage() {
  const [categories, cities] = await Promise.all([
    fetchCategoriesFresh(),
    fetchCitiesFresh(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-sm text-muted-foreground md:px-8">
          <Link href="/" className="hover:text-foreground">
            Inicio
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Registrar empresa</span>
        </div>
      </div>

      <RegisterBusinessForm initialCategories={categories} initialCities={cities} />

      <Footer />
    </div>
  )
}
