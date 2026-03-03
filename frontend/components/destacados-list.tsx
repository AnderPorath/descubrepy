"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { BusinessCard } from "@/components/business-card"
import {
  fetchFeaturedFiltered,
  fetchCategories,
  fetchCities,
  fetchSubcategories,
  type BusinessApi,
  type CategoryApi,
  type SubcategoryApi,
} from "@/lib/api"
import { Star, MapPin, Tag, Layers } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const FALLBACK_CITIES = [
  "Asunción", "Ciudad del Este", "Encarnación", "San Lorenzo", "Lambaré",
  "Fernando de la Mora", "Luque", "Capiatá", "Limpio", "Ñemby",
]

const FALLBACK_CATEGORIES: CategoryApi[] = [
  { id: 1, slug: "gastronomia", title: "Gastronomía", description: null, icon_name: "UtensilsCross", business_count: 0 },
  { id: 2, slug: "belleza-y-spa", title: "Belleza y Spa", description: null, icon_name: "Scissors", business_count: 0 },
  { id: 3, slug: "salud", title: "Salud", description: null, icon_name: "Stethoscope", business_count: 0 },
  { id: 4, slug: "cafeterias", title: "Cafeterías", description: null, icon_name: "Coffee", business_count: 0 },
  { id: 5, slug: "fitness", title: "Fitness", description: null, icon_name: "Dumbbell", business_count: 0 },
]

export function DestacadosList() {
  const [featured, setFeatured] = useState<BusinessApi[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState("")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [cities, setCities] = useState<string[]>(FALLBACK_CITIES)
  const [categories, setCategories] = useState<CategoryApi[]>(FALLBACK_CATEGORIES)
  const [subcategories, setSubcategories] = useState<SubcategoryApi[]>([])

  const loadSubcategories = useCallback(async (categorySlug: string) => {
    if (!categorySlug.trim()) {
      setSubcategories([])
      return
    }
    const subs = await fetchSubcategories(categorySlug)
    setSubcategories(Array.isArray(subs) ? subs : [])
  }, [])

  useEffect(() => {
    Promise.all([fetchCategories(), fetchCities()]).then(([cats, cits]) => {
      setCategories(Array.isArray(cats) && cats.length > 0 ? cats : FALLBACK_CATEGORIES)
      const list = Array.isArray(cits) ? cits.filter((c: string) => c !== "Todas las ciudades") : []
      setCities(list.length > 0 ? list : FALLBACK_CITIES)
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
    setLoading(true)
    fetchFeaturedFiltered({
      city: city.trim() || undefined,
      category: category.trim() || undefined,
      subcategory: subcategory.trim() || undefined,
    })
      .then((list) => setFeatured(Array.isArray(list) ? list : []))
      .finally(() => setLoading(false))
  }, [city, category, subcategory])

  if (loading && featured.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando destacados…</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      {/* Filtros */}
      <div className="mb-8 flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Ciudad
          </Label>
          <Select value={city || "all"} onValueChange={(v) => setCity(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
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
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
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
            <SelectTrigger className="w-[200px] h-9 text-sm">
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
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Subcategoría
            </Label>
            <Select
              value={subcategory || "all"}
              onValueChange={(v) => setSubcategory(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[200px] h-9 text-sm">
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

      {featured.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Star className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Aún no hay destacados</h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {city || category || subcategory
              ? "No hay negocios destacados con los filtros seleccionados. Probá otras opciones."
              : "Los negocios que marques como destacados al crear o editar aparecerán aquí."}
          </p>
          <Link
            href="/negocios"
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Ver todos los negocios
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            {featured.length} {featured.length === 1 ? "destacado" : "destacados"}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
