import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { fetchCategories } from "@/lib/api"
import {
  UtensilsCrossed,
  Dumbbell,
  ShoppingBag,
  Wrench,
  Scissors,
  Coffee,
  Stethoscope,
  GraduationCap,
  Car,
  Briefcase,
  Heart,
  Building2,
  Dog,
  Scale,
  Home,
  Pill,
  ShoppingCart,
  Camera,
  Calendar,
  Smartphone,
  type LucideIcon,
} from "lucide-react"

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

const DEFAULT_CATEGORIES = [
  { id: 1, slug: "gastronomia", title: "Gastronomia", description: "Restaurantes y gastronomía", icon_name: "UtensilsCrossed", business_count: 45 },
  { id: 2, slug: "belleza-y-spa", title: "Belleza y Spa", description: "Salones y centros de bienestar", icon_name: "Scissors", business_count: 32 },
  { id: 3, slug: "fitness", title: "Fitness", description: "Gimnasios y entrenamiento", icon_name: "Dumbbell", business_count: 18 },
  { id: 4, slug: "cafeterias", title: "Cafeterias", description: "Cafés y cafetería", icon_name: "Coffee", business_count: 27 },
  { id: 5, slug: "salud", title: "Salud", description: "Clínicas y servicios de salud", icon_name: "Stethoscope", business_count: 38 },
  { id: 6, slug: "automotriz", title: "Automotriz", description: "Talleres y servicios auto", icon_name: "Wrench", business_count: 15 },
  { id: 7, slug: "moda", title: "Moda", description: "Ropa y accesorios", icon_name: "ShoppingBag", business_count: 52 },
  { id: 8, slug: "hoteleria", title: "Hoteleria", description: "Hoteles y alojamiento", icon_name: "Building2", business_count: 12 },
  { id: 9, slug: "educacion", title: "Educacion", description: "Institutos y formación", icon_name: "GraduationCap", business_count: 20 },
  { id: 10, slug: "transporte", title: "Transporte", description: "Movilidad y logística", icon_name: "Car", business_count: 10 },
  { id: 11, slug: "servicios", title: "Servicios", description: "Profesionales a tu alcance", icon_name: "Briefcase", business_count: 35 },
  { id: 12, slug: "bienestar", title: "Bienestar", description: "Salud mental y bienestar", icon_name: "Heart", business_count: 22 },
  { id: 13, slug: "mascotas", title: "Mascotas", description: "Veterinarias, tiendas y cuidados", icon_name: "Dog", business_count: 14 },
  { id: 14, slug: "legal", title: "Legal", description: "Abogados y asesoría jurídica", icon_name: "Scale", business_count: 8 },
  { id: 15, slug: "inmobiliarias", title: "Inmobiliarias", description: "Ventas y alquileres", icon_name: "Home", business_count: 25 },
  { id: 16, slug: "farmacias", title: "Farmacias", description: "Farmacias y droguerías", icon_name: "Pill", business_count: 42 },
  { id: 17, slug: "supermercados", title: "Supermercados", description: "Supermercados y almacenes", icon_name: "ShoppingCart", business_count: 28 },
  { id: 18, slug: "fotografia", title: "Fotografia", description: "Estudios y servicios fotográficos", icon_name: "Camera", business_count: 11 },
  { id: 19, slug: "eventos", title: "Eventos", description: "Organización y salones de eventos", icon_name: "Calendar", business_count: 19 },
  { id: 20, slug: "tecnologia", title: "Tecnologia", description: "Informática y reparación", icon_name: "Smartphone", business_count: 16 },
]

export const metadata = {
  title: "Categorías - DescubrePY",
  description: "Explorá todas las categorías de negocios en Paraguay.",
}

export default async function CategoriasPage() {
  let categories = await fetchCategories()
  if (categories.length === 0) {
    categories = DEFAULT_CATEGORIES
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-primary">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8">
            <h1 className="font-serif text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
              Todas las categorías
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-primary-foreground/70">
              Explorá nuestro directorio de categorías y encontrá el negocio ideal para vos.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div
            className="gap-3 sm:gap-5"
            style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
          >
            {categories.map((category) => {
              const Icon = iconMap[category.icon_name] ?? Wrench
              return (
                <Link
                  key={category.id}
                  href={`/categorias/${category.slug}?from=categorias`}
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
        </section>
      </main>
      <Footer />
    </div>
  )
}
