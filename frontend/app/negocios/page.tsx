"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback, Suspense } from "react"
import { Search, SlidersHorizontal, MapPin, Tag, Layers } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BusinessCard } from "@/components/business-card"
import { Button } from "@/components/ui/button"
import {
  fetchBusinesses,
  fetchCategories,
  fetchCities,
  fetchSubcategories,
  type BusinessApi,
  type CategoryApi,
  type SubcategoryApi,
} from "@/lib/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Fallback cuando la API no responde (mismo contenido que la base de datos)
const FALLBACK_CITIES = [
  "Asunción", "Ciudad del Este", "Encarnación", "San Lorenzo", "Lambaré",
  "Fernando de la Mora", "Luque", "Capiatá", "Limpio", "Ñemby",
  "Pedro Juan Caballero", "Villarrica", "Coronel Oviedo", "Concepción", "Pilar",
  "Hernandarias", "Presidente Franco", "Itauguá", "Mariano Roque Alonso", "Villa Elisa",
]

const FALLBACK_CATEGORIES: CategoryApi[] = [
  { id: 1, slug: "gastronomia", title: "Gastronomía", description: null, icon_name: "UtensilsCross", business_count: 0 },
  { id: 2, slug: "belleza-y-spa", title: "Belleza y Spa", description: null, icon_name: "Scissors", business_count: 0 },
  { id: 3, slug: "fitness", title: "Fitness", description: null, icon_name: "Dumbbell", business_count: 0 },
  { id: 4, slug: "cafeterias", title: "Cafeterías", description: null, icon_name: "Coffee", business_count: 0 },
  { id: 5, slug: "salud", title: "Salud", description: null, icon_name: "Stethoscope", business_count: 0 },
  { id: 6, slug: "automotriz", title: "Automotriz", description: null, icon_name: "Wrench", business_count: 0 },
  { id: 7, slug: "moda", title: "Moda", description: null, icon_name: "ShoppingBag", business_count: 0 },
  { id: 8, slug: "hoteleria", title: "Hotelería", description: null, icon_name: "Building2", business_count: 0 },
  { id: 9, slug: "educacion", title: "Educación", description: null, icon_name: "GraduationCap", business_count: 0 },
  { id: 10, slug: "transporte", title: "Transporte", description: null, icon_name: "Car", business_count: 0 },
  { id: 11, slug: "servicios", title: "Servicios", description: null, icon_name: "Briefcase", business_count: 0 },
  { id: 12, slug: "bienestar", title: "Bienestar", description: null, icon_name: "Heart", business_count: 0 },
  { id: 13, slug: "mascotas", title: "Mascotas", description: null, icon_name: "Dog", business_count: 0 },
  { id: 14, slug: "legal", title: "Legal", description: null, icon_name: "Scale", business_count: 0 },
  { id: 15, slug: "inmobiliarias", title: "Inmobiliarias", description: null, icon_name: "Home", business_count: 0 },
  { id: 16, slug: "farmacias", title: "Farmacias", description: null, icon_name: "Pill", business_count: 0 },
  { id: 17, slug: "supermercados", title: "Supermercados", description: null, icon_name: "ShoppingCart", business_count: 0 },
  { id: 18, slug: "fotografia", title: "Fotografía", description: null, icon_name: "Camera", business_count: 0 },
  { id: 19, slug: "eventos", title: "Eventos", description: null, icon_name: "Calendar", business_count: 0 },
  { id: 20, slug: "tecnologia", title: "Tecnología", description: null, icon_name: "Smartphone", business_count: 0 },
]

// Fallback de subcategorías (mismo contenido que la base de datos)
const FALLBACK_SUBCATEGORIES: Record<string, Array<{ id: number; slug: string; title: string; sort_order: number }>> = {
  gastronomia: [
    { id: 1, slug: "pizzeria", title: "Pizzería", sort_order: 1 },
    { id: 2, slug: "hamburgueseria", title: "Hamburguesería", sort_order: 2 },
    { id: 3, slug: "parrilla", title: "Parrilla", sort_order: 3 },
    { id: 4, slug: "sushi", title: "Sushi", sort_order: 4 },
    { id: 5, slug: "comida-rapida", title: "Comida rápida", sort_order: 5 },
    { id: 6, slug: "comida-internacional", title: "Comida internacional", sort_order: 6 },
    { id: 7, slug: "postres-reposteria", title: "Postres y repostería", sort_order: 7 },
  ],
  "belleza-y-spa": [
    { id: 1, slug: "peluquerias", title: "Peluquerías", sort_order: 1 },
    { id: 2, slug: "barberias", title: "Barberías", sort_order: 2 },
    { id: 3, slug: "spa", title: "Spa", sort_order: 3 },
    { id: 4, slug: "unas", title: "Uñas", sort_order: 4 },
    { id: 5, slug: "estetica", title: "Estética", sort_order: 5 },
  ],
  fitness: [
    { id: 1, slug: "gimnasios", title: "Gimnasios", sort_order: 1 },
    { id: 2, slug: "yoga", title: "Yoga", sort_order: 2 },
    { id: 3, slug: "pilates", title: "Pilates", sort_order: 3 },
    { id: 4, slug: "crossfit", title: "CrossFit", sort_order: 4 },
    { id: 5, slug: "nutricion-deportiva", title: "Nutrición deportiva", sort_order: 5 },
  ],
  cafeterias: [
    { id: 1, slug: "cafe-especialidad", title: "Café de especialidad", sort_order: 1 },
    { id: 2, slug: "panaderias", title: "Panaderías", sort_order: 2 },
    { id: 3, slug: "confiterias", title: "Confiterías", sort_order: 3 },
  ],
  salud: [
    { id: 1, slug: "clinica", title: "Clínica", sort_order: 1 },
    { id: 2, slug: "farmacia", title: "Farmacia", sort_order: 2 },
    { id: 3, slug: "gimnasio", title: "Gimnasio", sort_order: 3 },
    { id: 4, slug: "odontologia", title: "Odontología", sort_order: 4 },
    { id: 5, slug: "pediatria", title: "Pediatría", sort_order: 5 },
    { id: 6, slug: "laboratorios", title: "Laboratorios", sort_order: 6 },
  ],
  automotriz: [
    { id: 1, slug: "talleres-mecanicos", title: "Talleres mecánicos", sort_order: 1 },
    { id: 2, slug: "lubricentros", title: "Lubricentros", sort_order: 2 },
    { id: 3, slug: "cerrajeria-automotriz", title: "Cerrajería automotriz", sort_order: 3 },
    { id: 4, slug: "concesionarias", title: "Concesionarias", sort_order: 4 },
  ],
  moda: [
    { id: 1, slug: "ropa-mujer", title: "Ropa mujer", sort_order: 1 },
    { id: 2, slug: "ropa-hombre", title: "Ropa hombre", sort_order: 2 },
    { id: 3, slug: "calzado", title: "Calzado", sort_order: 3 },
    { id: 4, slug: "accesorios", title: "Accesorios", sort_order: 4 },
    { id: 5, slug: "boutiques", title: "Boutiques", sort_order: 5 },
  ],
  hoteleria: [
    { id: 1, slug: "hoteles", title: "Hoteles", sort_order: 1 },
    { id: 2, slug: "hostels", title: "Hostels", sort_order: 2 },
    { id: 3, slug: "apart-hoteles", title: "Apart hoteles", sort_order: 3 },
    { id: 4, slug: "posadas", title: "Posadas", sort_order: 4 },
  ],
  educacion: [
    { id: 1, slug: "idiomas", title: "Idiomas", sort_order: 1 },
    { id: 2, slug: "musica", title: "Música", sort_order: 2 },
    { id: 3, slug: "informatica", title: "Informática", sort_order: 3 },
    { id: 4, slug: "cursos-talleres", title: "Cursos y talleres", sort_order: 4 },
  ],
  transporte: [
    { id: 1, slug: "taxis", title: "Taxis", sort_order: 1 },
    { id: 2, slug: "remises", title: "Remises", sort_order: 2 },
    { id: 3, slug: "envios", title: "Envíos", sort_order: 3 },
    { id: 4, slug: "alquiler-autos", title: "Alquiler de autos", sort_order: 4 },
  ],
  servicios: [
    { id: 1, slug: "plomeria", title: "Plomería", sort_order: 1 },
    { id: 2, slug: "electricidad", title: "Electricidad", sort_order: 2 },
    { id: 3, slug: "limpieza", title: "Limpieza", sort_order: 3 },
    { id: 4, slug: "mudanzas", title: "Mudanzas", sort_order: 4 },
    { id: 5, slug: "abogacia", title: "Abogacía", sort_order: 5 },
    { id: 6, slug: "contabilidad", title: "Contabilidad", sort_order: 6 },
    { id: 7, slug: "reparaciones", title: "Reparaciones", sort_order: 7 },
  ],
  bienestar: [
    { id: 1, slug: "psicologia", title: "Psicología", sort_order: 1 },
    { id: 2, slug: "masajes", title: "Masajes", sort_order: 2 },
    { id: 3, slug: "meditacion", title: "Meditación", sort_order: 3 },
    { id: 4, slug: "nutricion", title: "Nutrición", sort_order: 4 },
  ],
  mascotas: [
    { id: 1, slug: "veterinarias", title: "Veterinarias", sort_order: 1 },
    { id: 2, slug: "tiendas-mascotas", title: "Tiendas para mascotas", sort_order: 2 },
    { id: 3, slug: "peluqueria-canina", title: "Peluquería canina", sort_order: 3 },
  ],
  legal: [
    { id: 1, slug: "civil", title: "Derecho civil", sort_order: 1 },
    { id: 2, slug: "laboral", title: "Derecho laboral", sort_order: 2 },
    { id: 3, slug: "inmobiliario", title: "Derecho inmobiliario", sort_order: 3 },
  ],
  inmobiliarias: [
    { id: 1, slug: "ventas", title: "Ventas", sort_order: 1 },
    { id: 2, slug: "alquileres", title: "Alquileres", sort_order: 2 },
    { id: 3, slug: "administracion", title: "Administración", sort_order: 3 },
  ],
  farmacias: [
    { id: 1, slug: "farmacias", title: "Farmacias", sort_order: 1 },
    { id: 2, slug: "droguerias", title: "Droguerías", sort_order: 2 },
  ],
  supermercados: [
    { id: 1, slug: "supermercados", title: "Supermercados", sort_order: 1 },
    { id: 2, slug: "minimercados", title: "Minimercados", sort_order: 2 },
    { id: 3, slug: "almacenes", title: "Almacenes", sort_order: 3 },
  ],
  fotografia: [
    { id: 1, slug: "estudios", title: "Estudios fotográficos", sort_order: 1 },
    { id: 2, slug: "eventos", title: "Fotografía de eventos", sort_order: 2 },
    { id: 3, slug: "impresion", title: "Impresión", sort_order: 3 },
  ],
  eventos: [
    { id: 1, slug: "salones", title: "Salones de eventos", sort_order: 1 },
    { id: 2, slug: "catering", title: "Catering", sort_order: 2 },
    { id: 3, slug: "decoracion", title: "Decoración", sort_order: 3 },
    { id: 4, slug: "musica-vivo", title: "Música en vivo", sort_order: 4 },
  ],
  tecnologia: [
    { id: 1, slug: "reparacion-celulares", title: "Reparación de celulares", sort_order: 1 },
    { id: 2, slug: "informatica", title: "Informática", sort_order: 2 },
    { id: 3, slug: "electronica", title: "Electrónica", sort_order: 3 },
  ],
}

function NegociosContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const initialCity = searchParams.get("ciudad") || ""
  const initialCategory = searchParams.get("categoria") || ""
  const initialSubcategory = searchParams.get("subcategoria") || ""

  const [query, setQuery] = useState(initialQuery)
  const [city, setCity] = useState(initialCity)
  const [category, setCategory] = useState(initialCategory)
  const [subcategory, setSubcategory] = useState(initialSubcategory)
  const [showFilters, setShowFilters] = useState(false)
  const [businesses, setBusinesses] = useState<BusinessApi[]>([])
  const [categories, setCategories] = useState<CategoryApi[]>(FALLBACK_CATEGORIES)
  const [cities, setCities] = useState<string[]>(FALLBACK_CITIES)
  const [subcategories, setSubcategories] = useState<SubcategoryApi[]>([])
  const [loading, setLoading] = useState(true)

  const loadSubcategories = useCallback(async (categorySlug: string) => {
    if (!categorySlug.trim()) {
      setSubcategories([])
      return
    }
    const subs = await fetchSubcategories(categorySlug)
    const fromApi = Array.isArray(subs) && subs.length > 0 ? subs : []
    const fallback = FALLBACK_SUBCATEGORIES[categorySlug] ?? []
    setSubcategories(fromApi.length > 0 ? fromApi : fallback)
  }, [])

  useEffect(() => {
    Promise.all([fetchCategories(), fetchCities()]).then(([cats, cits]) => {
      setCategories(Array.isArray(cats) && cats.length > 0 ? cats : FALLBACK_CATEGORIES)
      const cityList = Array.isArray(cits) ? cits.filter((c) => c !== "Todas las ciudades") : []
      setCities(cityList.length > 0 ? cityList : FALLBACK_CITIES)
    })
  }, [])

  useEffect(() => {
    if (category.trim()) {
      loadSubcategories(category)
    } else {
      setSubcategories([])
      setSubcategory("")
    }
  }, [category, loadSubcategories])

  useEffect(() => {
    if (!category.trim()) setSubcategory("")
  }, [category])

  useEffect(() => {
    setLoading(true)
    const cat = category.trim() || undefined
    const sub = subcategory.trim() || undefined
    const c = city.trim() || undefined
    const q = query.trim() || undefined
    fetchBusinesses(cat, sub, c, q).then((data) => {
      const sorted = [...(data ?? [])].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      setBusinesses(sorted)
      setLoading(false)
    })
  }, [category, subcategory, city, query])

  const hasActiveFilters = city || category || subcategory || query

  return (
    <main className="flex-1">
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-primary-foreground md:text-4xl">
            Todos los negocios
          </h1>
          <p className="mt-3 text-base text-primary-foreground/70">
            Explorá nuestro directorio completo de negocios en Paraguay.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-primary-foreground/10 px-4 py-3 ring-1 ring-primary-foreground/10">
              <Search className="h-5 w-5 shrink-0 text-primary-foreground/50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, ubicación..."
                className="w-full bg-transparent text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none"
              />
            </div>

            <div className={`flex flex-wrap items-end gap-4 ${showFilters ? "block" : "hidden md:flex"}`}>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-primary-foreground/80 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Ciudad
                </Label>
                <Select value={city || "all"} onValueChange={(v) => setCity(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-[180px] border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground [&>span]:text-primary-foreground/90">
                    <SelectValue placeholder="Todas las ciudades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ciudades</SelectItem>
                    {cities.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-primary-foreground/80 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Categoría
                </Label>
                <Select
                  value={category || "all"}
                  onValueChange={(v) => {
                    setCategory(v === "all" ? "" : v)
                    setSubcategory("")
                  }}
                >
                  <SelectTrigger className="w-[200px] border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground [&>span]:text-primary-foreground/90">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {category ? (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-primary-foreground/80 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    Subcategoría
                  </Label>
                  <Select
                    value={subcategory || "all"}
                    onValueChange={(v) => setSubcategory(v === "all" ? "" : v)}
                  >
                    <SelectTrigger className="w-[200px] border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground [&>span]:text-primary-foreground/90">
                      <SelectValue placeholder="Todas las subcategorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las subcategorías</SelectItem>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.slug}>
                          {typeof sub.business_count === "number"
                            ? `${sub.title} (${sub.business_count})`
                            : sub.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 md:hidden w-full"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showFilters ? "Ocultar filtros" : "Ver filtros"}
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <p className="mb-6 text-sm text-muted-foreground">
          {loading ? "Cargando…" : `${businesses.length} ${businesses.length === 1 ? "resultado" : "resultados"}`}
          {query.trim() ? ` para "${query}"` : ""}
          {hasActiveFilters && !loading ? " con los filtros aplicados" : ""}
        </p>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-sm">Cargando negocios…</p>
          </div>
        ) : businesses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Sin resultados</h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              No encontramos negocios que coincidan con los filtros o la búsqueda. Probá cambiando ciudad, categoría o el texto.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}

export default function NegociosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={<div className="flex-1 py-20 text-center text-muted-foreground">Cargando…</div>}>
        <NegociosContent />
      </Suspense>
      <Footer />
    </div>
  )
}
