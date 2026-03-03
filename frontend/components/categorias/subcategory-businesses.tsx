"use client"

import { useEffect, useState } from "react"
import { BusinessCard } from "@/components/business-card"
import { fetchBusinesses, fetchCities } from "@/lib/api"
import type { BusinessApi } from "@/lib/api"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin } from "lucide-react"
import { CategoryIcon } from "@/components/category-icon"

type Props = {
  categorySlug: string
  subslug: string
}

const FALLBACK_CITIES = [
  "Asunción", "Ciudad del Este", "Encarnación", "San Lorenzo", "Lambaré",
  "Fernando de la Mora", "Luque", "Capiatá", "Limpio", "Ñemby",
]

export function SubcategoryBusinesses({ categorySlug, subslug }: Props) {
  const [businesses, setBusinesses] = useState<BusinessApi[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState("")
  const [cities, setCities] = useState<string[]>(FALLBACK_CITIES)

  useEffect(() => {
    fetchCities().then((list) => {
      const arr = Array.isArray(list) ? list.filter((c: string) => c !== "Todas las ciudades") : []
      setCities(arr.length > 0 ? arr : FALLBACK_CITIES)
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const subcategorySlug = subslug === "todos" ? undefined : subslug
    const cityFilter = city.trim() || undefined
    fetchBusinesses(categorySlug, subcategorySlug, cityFilter)
      .then((list) => {
        const arr = list ?? []
        const sorted = [...arr].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        if (!cancelled) setBusinesses(sorted)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [categorySlug, subslug, city])

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando negocios…</p>
        </div>
      </section>
    )
  }

  if (businesses.length > 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Filtrar por ciudad
            </Label>
            <Select value={city || "all"} onValueChange={(v) => setCity(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[200px] h-9 text-sm">
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
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          {businesses.length} {businesses.length === 1 ? "resultado" : "resultados"}
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Filtrar por ciudad
          </Label>
          <Select value={city || "all"} onValueChange={(v) => setCity(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[200px] h-9 text-sm">
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
      </div>
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <CategoryIcon categorySlug={categorySlug} subcategorySlug={subslug} size="xl" variant="muted" />
        <h2 className="text-xl font-bold text-foreground">Próximamente</h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {city.trim()
            ? "No hay negocios en esta subcategoría para la ciudad elegida. Probá otra ciudad."
            : "Estamos agregando negocios en esta subcategoría. Volvé pronto."}
        </p>
      </div>
    </section>
  )
}
