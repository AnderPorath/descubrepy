import Link from "next/link"
import { UtensilsCrossed, Dumbbell, ShoppingBag, Wrench, Scissors, Coffee, Stethoscope, GraduationCap, Car, Briefcase, Heart, Building2, ArrowRight, Dog, Scale, Home, Pill, ShoppingCart, Camera, Calendar, Smartphone, LucideIcon } from "lucide-react"
import { fetchCategories } from "@/lib/api"

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Scissors,
  Dumbbell,
  Coffee,
  Stethoscope,
  Wrench,
  ShoppingBag,
  Building2,
  GraduationCap,
  Car,
  Briefcase,
  Heart,
  Dog,
  Scale,
  Home,
  Pill,
  ShoppingCart,
  Camera,
  Calendar,
  Smartphone,
}

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
    <section id="categorias" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Encuentra lo que buscas
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base font-normal leading-relaxed text-gray-500">
            Navega entre nuestras categorias y descubri negocios increibles en todo Paraguay.
          </p>
        </div>

        {/* 2 filas × 6 columnas (inicio) */}
        <div
          className="mt-10 gap-3 sm:gap-5 lg:mt-12"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}
        >
          {categories.slice(0, 12).map((category) => {
            const Icon = iconMap[category.icon_name] ?? Wrench
            return (
              <Link
                key={category.id}
                href={`/categorias/${category.slug}?from=inicio`}
                className="group flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border border-[#e5e7eb] bg-white p-4 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] sm:min-h-[140px] sm:p-5 sm:gap-4"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#eef2f7] transition-colors duration-300 group-hover:bg-red-600 sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                  <Icon className="h-6 w-6 text-[#1f3b64] transition-colors duration-300 group-hover:text-white sm:h-7 sm:w-7 lg:h-10 lg:w-10" />
                </div>
                <h3 className="text-sm font-semibold text-[#111827] sm:text-base lg:text-lg">
                  {category.title}
                </h3>
                <p className="text-xs text-[#6b7280] sm:text-sm lg:text-base">
                  {category.business_count} negocios
                </p>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 flex justify-center sm:mt-16 lg:mt-20">
          <Link
            href="/categorias"
            className="inline-flex items-center gap-2 text-base font-semibold text-blue-700 transition-colors hover:text-blue-800"
          >
            Ver todas las categorias
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
