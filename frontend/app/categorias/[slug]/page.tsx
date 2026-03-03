import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CategoryIcon } from "@/components/category-icon"
import { fetchCategories, fetchSubcategories } from "@/lib/api"

// Fallback cuando el backend no responde (mismos slugs que la lista de categorías)
const FALLBACK_CATEGORIES: Array<{ slug: string; title: string; description: string | null; icon_name: string }> = [
  { slug: "gastronomia", title: "Gastronomía", description: "Restaurantes y gastronomía", icon_name: "UtensilsCrossed" },
  { slug: "belleza-y-spa", title: "Belleza y Spa", description: "Salones y centros de bienestar", icon_name: "Scissors" },
  { slug: "fitness", title: "Fitness", description: "Gimnasios y entrenamiento", icon_name: "Dumbbell" },
  { slug: "cafeterias", title: "Cafeterías", description: "Cafés y cafetería", icon_name: "Coffee" },
  { slug: "salud", title: "Salud", description: "Clínicas y servicios de salud", icon_name: "Stethoscope" },
  { slug: "automotriz", title: "Automotriz", description: "Talleres y servicios auto", icon_name: "Wrench" },
  { slug: "moda", title: "Moda", description: "Ropa y accesorios", icon_name: "ShoppingBag" },
  { slug: "hoteleria", title: "Hotelería", description: "Hoteles y alojamiento", icon_name: "Building2" },
  { slug: "educacion", title: "Educación", description: "Institutos y formación", icon_name: "GraduationCap" },
  { slug: "transporte", title: "Transporte", description: "Movilidad y logística", icon_name: "Car" },
  { slug: "servicios", title: "Servicios", description: "Profesionales a tu alcance", icon_name: "Briefcase" },
  { slug: "bienestar", title: "Bienestar", description: "Salud mental y bienestar", icon_name: "Heart" },
  { slug: "mascotas", title: "Mascotas", description: "Veterinarias, tiendas y cuidados", icon_name: "Dog" },
  { slug: "legal", title: "Legal", description: "Abogados y asesoría jurídica", icon_name: "Scale" },
  { slug: "inmobiliarias", title: "Inmobiliarias", description: "Ventas y alquileres", icon_name: "Home" },
  { slug: "farmacias", title: "Farmacias", description: "Farmacias y droguerías", icon_name: "Pill" },
  { slug: "supermercados", title: "Supermercados", description: "Supermercados y almacenes", icon_name: "ShoppingCart" },
  { slug: "fotografia", title: "Fotografía", description: "Estudios y servicios fotográficos", icon_name: "Camera" },
  { slug: "eventos", title: "Eventos", description: "Organización y salones de eventos", icon_name: "Calendar" },
  { slug: "tecnologia", title: "Tecnología", description: "Informática y reparación", icon_name: "Smartphone" },
]

// Fallback de subcategorías por categoría (cuando la API/DB no devuelve datos)
const FALLBACK_SUBCATEGORIES: Record<string, Array<{ id: number; slug: string; title: string }>> = {
  gastronomia: [
    { id: 1, slug: "pizzeria", title: "Pizzería" },
    { id: 2, slug: "hamburgueseria", title: "Hamburguesería" },
    { id: 3, slug: "parrilla", title: "Parrilla" },
    { id: 4, slug: "sushi", title: "Sushi" },
    { id: 5, slug: "comida-rapida", title: "Comida rápida" },
    { id: 6, slug: "comida-internacional", title: "Comida internacional" },
    { id: 7, slug: "postres-reposteria", title: "Postres y repostería" },
  ],
  "belleza-y-spa": [
    { id: 1, slug: "peluquerias", title: "Peluquerías" },
    { id: 2, slug: "barberias", title: "Barberías" },
    { id: 3, slug: "spa", title: "Spa" },
    { id: 4, slug: "unas", title: "Uñas" },
    { id: 5, slug: "estetica", title: "Estética" },
  ],
  fitness: [
    { id: 1, slug: "gimnasios", title: "Gimnasios" },
    { id: 2, slug: "yoga", title: "Yoga" },
    { id: 3, slug: "pilates", title: "Pilates" },
    { id: 4, slug: "crossfit", title: "CrossFit" },
    { id: 5, slug: "nutricion-deportiva", title: "Nutrición deportiva" },
  ],
  cafeterias: [
    { id: 1, slug: "cafe-especialidad", title: "Café de especialidad" },
    { id: 2, slug: "panaderias", title: "Panaderías" },
    { id: 3, slug: "confiterias", title: "Confiterías" },
  ],
  salud: [
    { id: 1, slug: "clinica", title: "Clínica" },
    { id: 2, slug: "farmacia", title: "Farmacia" },
    { id: 3, slug: "gimnasio", title: "Gimnasio" },
    { id: 4, slug: "odontologia", title: "Odontología" },
    { id: 5, slug: "pediatria", title: "Pediatría" },
    { id: 6, slug: "laboratorios", title: "Laboratorios" },
  ],
  automotriz: [
    { id: 1, slug: "talleres-mecanicos", title: "Talleres mecánicos" },
    { id: 2, slug: "lubricentros", title: "Lubricentros" },
    { id: 3, slug: "cerrajeria-automotriz", title: "Cerrajería automotriz" },
    { id: 4, slug: "concesionarias", title: "Concesionarias" },
  ],
  moda: [
    { id: 1, slug: "ropa-mujer", title: "Ropa mujer" },
    { id: 2, slug: "ropa-hombre", title: "Ropa hombre" },
    { id: 3, slug: "calzado", title: "Calzado" },
    { id: 4, slug: "accesorios", title: "Accesorios" },
    { id: 5, slug: "boutiques", title: "Boutiques" },
  ],
  hoteleria: [
    { id: 1, slug: "hoteles", title: "Hoteles" },
    { id: 2, slug: "hostels", title: "Hostels" },
    { id: 3, slug: "apart-hoteles", title: "Apart hoteles" },
    { id: 4, slug: "posadas", title: "Posadas" },
  ],
  educacion: [
    { id: 1, slug: "idiomas", title: "Idiomas" },
    { id: 2, slug: "musica", title: "Música" },
    { id: 3, slug: "informatica", title: "Informática" },
    { id: 4, slug: "cursos-talleres", title: "Cursos y talleres" },
  ],
  transporte: [
    { id: 1, slug: "taxis", title: "Taxis" },
    { id: 2, slug: "remises", title: "Remises" },
    { id: 3, slug: "envios", title: "Envíos" },
    { id: 4, slug: "alquiler-autos", title: "Alquiler de autos" },
  ],
  servicios: [
    { id: 1, slug: "plomeria", title: "Plomería" },
    { id: 2, slug: "electricidad", title: "Electricidad" },
    { id: 3, slug: "limpieza", title: "Limpieza" },
    { id: 4, slug: "mudanzas", title: "Mudanzas" },
  ],
  bienestar: [
    { id: 1, slug: "psicologia", title: "Psicología" },
    { id: 2, slug: "masajes", title: "Masajes" },
    { id: 3, slug: "meditacion", title: "Meditación" },
    { id: 4, slug: "nutricion", title: "Nutrición" },
  ],
  mascotas: [
    { id: 1, slug: "veterinarias", title: "Veterinarias" },
    { id: 2, slug: "tiendas-mascotas", title: "Tiendas para mascotas" },
    { id: 3, slug: "peluqueria-canina", title: "Peluquería canina" },
  ],
  legal: [
    { id: 1, slug: "civil", title: "Derecho civil" },
    { id: 2, slug: "laboral", title: "Derecho laboral" },
    { id: 3, slug: "inmobiliario", title: "Derecho inmobiliario" },
  ],
  inmobiliarias: [
    { id: 1, slug: "ventas", title: "Ventas" },
    { id: 2, slug: "alquileres", title: "Alquileres" },
    { id: 3, slug: "administracion", title: "Administración" },
  ],
  farmacias: [
    { id: 1, slug: "farmacias", title: "Farmacias" },
    { id: 2, slug: "droguerias", title: "Droguerías" },
  ],
  supermercados: [
    { id: 1, slug: "supermercados", title: "Supermercados" },
    { id: 2, slug: "minimercados", title: "Minimercados" },
    { id: 3, slug: "almacenes", title: "Almacenes" },
  ],
  fotografia: [
    { id: 1, slug: "estudios", title: "Estudios fotográficos" },
    { id: 2, slug: "eventos", title: "Fotografía de eventos" },
    { id: 3, slug: "impresion", title: "Impresión" },
  ],
  eventos: [
    { id: 1, slug: "salones", title: "Salones de eventos" },
    { id: 2, slug: "catering", title: "Catering" },
    { id: 3, slug: "decoracion", title: "Decoración" },
    { id: 4, slug: "musica-vivo", title: "Música en vivo" },
  ],
  tecnologia: [
    { id: 1, slug: "reparacion-celulares", title: "Reparación de celulares" },
    { id: 2, slug: "informatica", title: "Informática" },
    { id: 3, slug: "electronica", title: "Electrónica" },
  ],
}

export const dynamicParams = true

export async function generateStaticParams() {
  const categories = await fetchCategories()
  const list = categories.length > 0 ? categories : FALLBACK_CATEGORIES.map((c, i) => ({ id: i + 1, slug: c.slug, title: c.title, description: c.description, icon_name: c.icon_name, business_count: 0 }))
  return list.map((cat) => ({ slug: cat.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const categories = await fetchCategories()
  const category = categories.find((c) => c.slug === slug)
  if (!category) return { title: "Categoría no encontrada" }
  return {
    title: `${category.title} - DescubrePY`,
    description: category.description ?? `Subcategorías y negocios de ${category.title} en Paraguay.`,
  }
}

export default async function CategorySlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { slug } = await params
  const { from } = await searchParams
  const [categoriesRes, subcategories] = await Promise.all([
    fetchCategories(),
    fetchSubcategories(slug),
  ])
  const categories = categoriesRes.length > 0 ? categoriesRes : FALLBACK_CATEGORIES.map((c, i) => ({ id: i + 1, slug: c.slug, title: c.title, description: c.description, icon_name: c.icon_name, business_count: 0 }))
  const category = categories.find((c) => c.slug === slug)
  if (!category) notFound()

  const subcategoriesList = subcategories.length > 0 ? subcategories : (FALLBACK_SUBCATEGORIES[slug] ?? [])

  const fromInicio = from === "inicio"

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-primary">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <Link
              href={fromInicio ? "/" : "/categorias"}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/90"
            >
              <ArrowLeft className="h-4 w-4" />
              {fromInicio ? "Volver al inicio" : "Volver a todas las categorías"}
            </Link>
            <div className="flex items-center gap-6">
            <CategoryIcon iconName={category.icon_name} size="xl" variant="onDark" />
            <div>
              <h1 className="font-serif text-3xl font-bold text-primary-foreground md:text-4xl">
                {category.title}
              </h1>
              <p className="mt-2 text-base text-primary-foreground/70">
                {category.description ?? `Elegí una subcategoría para ver negocios.`}
              </p>
            </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div
            className="gap-3 sm:gap-5"
            style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
          >
            {subcategoriesList.map((sub) => (
              <Link
                key={sub.id}
                href={`/categorias/${slug}/${sub.slug}`}
                className="group flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border border-[#e5e7eb] bg-white p-4 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] sm:min-h-[140px] sm:p-5 sm:gap-4"
              >
                <CategoryIcon iconName={category.icon_name} size="default" className="transition-colors duration-300 group-hover:from-primary/30 group-hover:to-primary/10 sm:scale-110" />
                <h3 className="text-sm font-semibold text-[#111827] sm:text-base lg:text-lg">
                  {sub.title}
                </h3>
                <p className="text-xs text-[#6b7280] sm:text-sm lg:text-base">
                  {typeof sub.business_count === "number" ? `${sub.business_count} ${sub.business_count === 1 ? "local" : "locales"}` : "Ver negocios"}
                </p>
              </Link>
            ))}
            <Link
              href={`/categorias/${slug}/todos`}
              className="group flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border border-[#e5e7eb] bg-white p-4 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] sm:min-h-[140px] sm:p-5 sm:gap-4"
            >
              <CategoryIcon iconName={category.icon_name} size="default" className="transition-colors duration-300 group-hover:from-primary/30 group-hover:to-primary/10 sm:scale-110" />
              <h3 className="text-sm font-semibold text-[#111827] sm:text-base lg:text-lg">
                Ver todos los negocios
              </h3>
              <p className="text-xs text-[#6b7280] sm:text-sm lg:text-base">
                Toda la categoría
              </p>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
