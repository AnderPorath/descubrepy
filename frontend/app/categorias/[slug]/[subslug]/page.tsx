import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SubcategoryBusinesses } from "@/components/categorias/subcategory-businesses"
import { CategoryIcon } from "@/components/category-icon"
import { fetchCategories, fetchSubcategories } from "@/lib/api"

const FALLBACK_CATEGORIES: Array<{ slug: string; title: string; icon_name: string }> = [
  { slug: "gastronomia", title: "Gastronomía", icon_name: "UtensilsCrossed" },
  { slug: "belleza-y-spa", title: "Belleza y Spa", icon_name: "Scissors" },
  { slug: "fitness", title: "Fitness", icon_name: "Dumbbell" },
  { slug: "cafeterias", title: "Cafeterías", icon_name: "Coffee" },
  { slug: "salud", title: "Salud", icon_name: "Stethoscope" },
  { slug: "automotriz", title: "Automotriz", icon_name: "Wrench" },
  { slug: "moda", title: "Moda", icon_name: "ShoppingBag" },
  { slug: "hoteleria", title: "Hotelería", icon_name: "Building2" },
  { slug: "educacion", title: "Educación", icon_name: "GraduationCap" },
  { slug: "transporte", title: "Transporte", icon_name: "Car" },
  { slug: "servicios", title: "Servicios", icon_name: "Briefcase" },
  { slug: "bienestar", title: "Bienestar", icon_name: "Heart" },
  { slug: "mascotas", title: "Mascotas", icon_name: "Dog" },
  { slug: "legal", title: "Legal", icon_name: "Scale" },
  { slug: "inmobiliarias", title: "Inmobiliarias", icon_name: "Home" },
  { slug: "farmacias", title: "Farmacias", icon_name: "Pill" },
  { slug: "supermercados", title: "Supermercados", icon_name: "ShoppingCart" },
  { slug: "fotografia", title: "Fotografía", icon_name: "Camera" },
  { slug: "eventos", title: "Eventos", icon_name: "Calendar" },
  { slug: "tecnologia", title: "Tecnología", icon_name: "Smartphone" },
]

const FALLBACK_SUBCATEGORIES: Record<string, Array<{ slug: string; title: string }>> = {
  gastronomia: [
    { slug: "pizzeria", title: "Pizzería" },
    { slug: "hamburgueseria", title: "Hamburguesería" },
    { slug: "parrilla", title: "Parrilla" },
    { slug: "sushi", title: "Sushi" },
    { slug: "comida-rapida", title: "Comida rápida" },
    { slug: "comida-internacional", title: "Comida internacional" },
    { slug: "postres-reposteria", title: "Postres y repostería" },
  ],
  "belleza-y-spa": [{ slug: "peluquerias", title: "Peluquerías" }, { slug: "barberias", title: "Barberías" }, { slug: "spa", title: "Spa" }, { slug: "unas", title: "Uñas" }, { slug: "estetica", title: "Estética" }],
  fitness: [{ slug: "gimnasios", title: "Gimnasios" }, { slug: "yoga", title: "Yoga" }, { slug: "pilates", title: "Pilates" }, { slug: "crossfit", title: "CrossFit" }, { slug: "nutricion-deportiva", title: "Nutrición deportiva" }],
  cafeterias: [{ slug: "cafe-especialidad", title: "Café de especialidad" }, { slug: "panaderias", title: "Panaderías" }, { slug: "confiterias", title: "Confiterías" }],
  salud: [{ slug: "clinica", title: "Clínica" }, { slug: "farmacia", title: "Farmacia" }, { slug: "gimnasio", title: "Gimnasio" }, { slug: "odontologia", title: "Odontología" }, { slug: "pediatria", title: "Pediatría" }, { slug: "laboratorios", title: "Laboratorios" }],
  automotriz: [{ slug: "talleres-mecanicos", title: "Talleres mecánicos" }, { slug: "lubricentros", title: "Lubricentros" }, { slug: "cerrajeria-automotriz", title: "Cerrajería automotriz" }, { slug: "concesionarias", title: "Concesionarias" }],
  moda: [{ slug: "ropa-mujer", title: "Ropa mujer" }, { slug: "ropa-hombre", title: "Ropa hombre" }, { slug: "calzado", title: "Calzado" }, { slug: "accesorios", title: "Accesorios" }, { slug: "boutiques", title: "Boutiques" }],
  hoteleria: [{ slug: "hoteles", title: "Hoteles" }, { slug: "hostels", title: "Hostels" }, { slug: "apart-hoteles", title: "Apart hoteles" }, { slug: "posadas", title: "Posadas" }],
  educacion: [{ slug: "idiomas", title: "Idiomas" }, { slug: "musica", title: "Música" }, { slug: "informatica", title: "Informática" }, { slug: "cursos-talleres", title: "Cursos y talleres" }],
  transporte: [{ slug: "taxis", title: "Taxis" }, { slug: "remises", title: "Remises" }, { slug: "envios", title: "Envíos" }, { slug: "alquiler-autos", title: "Alquiler de autos" }],
  servicios: [{ slug: "plomeria", title: "Plomería" }, { slug: "electricidad", title: "Electricidad" }, { slug: "limpieza", title: "Limpieza" }, { slug: "mudanzas", title: "Mudanzas" }],
  bienestar: [{ slug: "psicologia", title: "Psicología" }, { slug: "masajes", title: "Masajes" }, { slug: "meditacion", title: "Meditación" }, { slug: "nutricion", title: "Nutrición" }],
  mascotas: [{ slug: "veterinarias", title: "Veterinarias" }, { slug: "tiendas-mascotas", title: "Tiendas para mascotas" }, { slug: "peluqueria-canina", title: "Peluquería canina" }],
  legal: [{ slug: "civil", title: "Derecho civil" }, { slug: "laboral", title: "Derecho laboral" }, { slug: "inmobiliario", title: "Derecho inmobiliario" }],
  inmobiliarias: [{ slug: "ventas", title: "Ventas" }, { slug: "alquileres", title: "Alquileres" }, { slug: "administracion", title: "Administración" }],
  farmacias: [{ slug: "farmacias", title: "Farmacias" }, { slug: "droguerias", title: "Droguerías" }],
  supermercados: [{ slug: "supermercados", title: "Supermercados" }, { slug: "minimercados", title: "Minimercados" }, { slug: "almacenes", title: "Almacenes" }],
  fotografia: [{ slug: "estudios", title: "Estudios fotográficos" }, { slug: "eventos", title: "Fotografía de eventos" }, { slug: "impresion", title: "Impresión" }],
  eventos: [{ slug: "salones", title: "Salones de eventos" }, { slug: "catering", title: "Catering" }, { slug: "decoracion", title: "Decoración" }, { slug: "musica-vivo", title: "Música en vivo" }],
  tecnologia: [{ slug: "reparacion-celulares", title: "Reparación de celulares" }, { slug: "informatica", title: "Informática" }, { slug: "electronica", title: "Electrónica" }],
}

export const dynamicParams = true

export async function generateStaticParams() {
  const categories = await fetchCategories()
  const list = categories.length > 0 ? categories : FALLBACK_CATEGORIES.map((c, i) => ({ id: i + 1, slug: c.slug, title: c.title, icon_name: c.icon_name }))
  const params: { slug: string; subslug: string }[] = []
  for (const cat of list) {
    const subs = await fetchSubcategories(cat.slug)
    for (const sub of subs) {
      params.push({ slug: cat.slug, subslug: sub.slug })
    }
    params.push({ slug: cat.slug, subslug: "todos" })
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subslug: string }>
}) {
  const { slug, subslug } = await params
  const categoriesRes = await fetchCategories()
  const categories = categoriesRes.length > 0 ? categoriesRes : FALLBACK_CATEGORIES.map((c, i) => ({ id: i + 1, slug: c.slug, title: c.title, icon_name: c.icon_name }))
  const category = categories.find((c) => c.slug === slug)
  if (!category) return { title: "Categoría no encontrada" }
  if (subslug === "todos") {
    return {
      title: `${category.title} - Todos - DescubrePY`,
      description: `Todos los negocios de ${category.title} en Paraguay.`,
    }
  }
  const subcategoriesRes = await fetchSubcategories(slug)
  const fallbackSubs = FALLBACK_SUBCATEGORIES[slug] ?? []
  const subList = subcategoriesRes.length > 0 ? subcategoriesRes : fallbackSubs.map((s, i) => ({ id: i + 1, slug: s.slug, title: s.title, sort_order: i + 1 }))
  const sub = subList.find((s) => s.slug === subslug)
  if (!sub) return { title: "Subcategoría no encontrada" }
  return {
    title: `${sub.title} - ${category.title} - DescubrePY`,
    description: `Negocios de ${sub.title} en ${category.title}.`,
  }
}

export default async function CategorySubslugPage({
  params,
}: {
  params: Promise<{ slug: string; subslug: string }>
}) {
  const { slug, subslug } = await params
  const [categoriesRes, subcategoriesRes] = await Promise.all([
    fetchCategories(),
    fetchSubcategories(slug),
  ])
  const categories = categoriesRes.length > 0 ? categoriesRes : FALLBACK_CATEGORIES.map((c, i) => ({ id: i + 1, slug: c.slug, title: c.title, description: null, icon_name: c.icon_name, business_count: 0 }))
  const category = categories.find((c) => c.slug === slug)
  if (!category) notFound()

  const fallbackSubs = FALLBACK_SUBCATEGORIES[slug] ?? []
  const subcategoriesList = subcategoriesRes.length > 0 ? subcategoriesRes : fallbackSubs.map((s, i) => ({ id: i + 1, slug: s.slug, title: s.title, sort_order: i + 1 }))

  const isTodos = subslug === "todos"
  if (!isTodos) {
    const sub = subcategoriesList.find((s) => s.slug === subslug)
    if (!sub) notFound()
  }

  const pageTitle = isTodos ? `Todos los negocios de ${category.title}` : subcategoriesList.find((s) => s.slug === subslug)?.title ?? subslug

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-primary">
          <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
            <Link
              href={`/categorias/${slug}`}
              className="mb-4 inline-flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a {category.title}
            </Link>
            <div className="flex items-center gap-6">
              <CategoryIcon iconName={category.icon_name} size="xl" variant="onDark" />
              <div>
                <h1 className="font-serif text-3xl font-bold text-primary-foreground md:text-4xl">
                  {pageTitle}
                </h1>
                <p className="mt-2 text-base text-primary-foreground/70">
                  {category.title}
                  {!isTodos && ` · ${subcategoriesList.find((s) => s.slug === subslug)?.title}`}
                </p>
              </div>
            </div>
          </div>
        </section>

        <SubcategoryBusinesses categorySlug={slug} subslug={subslug} iconName={category.icon_name} />
      </main>
      <Footer />
    </div>
  )
}
