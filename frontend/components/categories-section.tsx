import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CategoriesGrid, CategoriesMarquee } from "@/components/categories-grid"
import { Reveal } from "@/components/motion/primitives"
import { fetchCategories } from "@/lib/api"

const DEFAULT_CATEGORIES: Array<{ id: number; slug: string; title: string; description: string | null; icon_name: string; business_count: number }> = [
  { id: 1, slug: "gastronomia", title: "Gastronomia", description: null, icon_name: "UtensilsCrossed", business_count: 0 },
  { id: 2, slug: "belleza-y-spa", title: "Belleza y Spa", description: null, icon_name: "Scissors", business_count: 0 },
  { id: 3, slug: "fitness", title: "Fitness", description: null, icon_name: "Dumbbell", business_count: 0 },
  { id: 4, slug: "cafeterias", title: "Cafeterias", description: null, icon_name: "Coffee", business_count: 0 },
  { id: 5, slug: "salud", title: "Salud", description: null, icon_name: "Stethoscope", business_count: 0 },
  { id: 6, slug: "automotriz", title: "Automotriz", description: null, icon_name: "Wrench", business_count: 0 },
  { id: 7, slug: "moda", title: "Moda", description: null, icon_name: "ShoppingBag", business_count: 0 },
  { id: 8, slug: "hoteleria", title: "Hoteleria", description: null, icon_name: "Building2", business_count: 0 },
  { id: 9, slug: "educacion", title: "Educacion", description: null, icon_name: "GraduationCap", business_count: 0 },
  { id: 10, slug: "transporte", title: "Transporte", description: null, icon_name: "Car", business_count: 0 },
  { id: 11, slug: "servicios", title: "Servicios", description: null, icon_name: "Briefcase", business_count: 0 },
  { id: 12, slug: "bienestar", title: "Bienestar", description: null, icon_name: "Heart", business_count: 0 },
  { id: 13, slug: "mascotas", title: "Mascotas", description: null, icon_name: "Dog", business_count: 0 },
  { id: 14, slug: "legal", title: "Legal", description: null, icon_name: "Scale", business_count: 0 },
  { id: 15, slug: "inmobiliarias", title: "Inmobiliarias", description: null, icon_name: "Home", business_count: 0 },
  { id: 16, slug: "farmacias", title: "Farmacias", description: null, icon_name: "Pill", business_count: 0 },
  { id: 17, slug: "supermercados", title: "Supermercados", description: null, icon_name: "ShoppingCart", business_count: 0 },
  { id: 18, slug: "fotografia", title: "Fotografia", description: null, icon_name: "Camera", business_count: 0 },
  { id: 19, slug: "eventos", title: "Eventos", description: null, icon_name: "Calendar", business_count: 0 },
  { id: 20, slug: "tecnologia", title: "Tecnologia", description: null, icon_name: "Smartphone", business_count: 0 },
]

export async function CategoriesSection() {
  let categories: Array<{ id: number; slug: string; title: string; description: string | null; icon_name: string; business_count: number }> = []
  try {
    categories = await fetchCategories()
  } catch {
    // Fallback si el backend no está
  }
  if (categories.length === 0) {
    categories = DEFAULT_CATEGORIES
  }

  return (
    <section id="categorias" className="scroll-mt-20 bg-white pb-20 pt-4 lg:pb-28 lg:pt-6">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <CategoriesMarquee categories={categories} />

        <Reveal className="mt-10 text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Encuentra lo que buscas
          </h2>
          <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-[#E52B2B] via-amber-300 to-[#0038A8]" />
          <p className="mx-auto mt-5 max-w-xl text-base font-normal leading-relaxed text-gray-500">
            Navega entre nuestras categorias y descubri negocios increibles en todo Paraguay.
          </p>
        </Reveal>

        {/* 2 filas × 6 columnas (inicio) */}
        <CategoriesGrid categories={categories.slice(0, 12)} />

        <Reveal className="mt-12 flex justify-center sm:mt-16 lg:mt-20" delay={0.1}>
          <Link
            href="/categorias"
            className="group inline-flex items-center gap-2 text-base font-semibold text-blue-700 transition-colors hover:text-blue-800"
          >
            Ver todas las categorias
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
