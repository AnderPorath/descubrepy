"use client"

import { useEffect, useState, useMemo } from "react"
import { BusinessCard } from "@/components/business-card"
import { fetchBusinesses } from "@/lib/api"
import { DepartmentDistrictFilters } from "@/components/department-district-filters"
import type { BusinessApi } from "@/lib/api"
import { CategoryIcon } from "@/components/category-icon"
import { getDistrictsForDepartment } from "@/lib/paraguay-departments"

type Props = {
  categorySlug: string
  subslug: string
}

export function SubcategoryBusinesses({ categorySlug, subslug }: Props) {
  const [businesses, setBusinesses] = useState<BusinessApi[]>([])
  const [loading, setLoading] = useState(true)
  const [departmentKey, setDepartmentKey] = useState("")
  const [city, setCity] = useState("")

  const departmentCities = useMemo(() => {
    if (city.trim()) return undefined
    if (!departmentKey.trim()) return undefined
    const list = getDistrictsForDepartment(departmentKey)
    return list.length > 0 ? list : undefined
  }, [city, departmentKey])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const subcategorySlug = subslug === "todos" ? undefined : subslug
    const cityFilter = city.trim() || undefined
    fetchBusinesses(categorySlug, subcategorySlug, cityFilter, undefined, departmentCities)
      .then((list) => {
        const arr = list ?? []
        const sorted = [...arr].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        if (!cancelled) setBusinesses(sorted)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [categorySlug, subslug, city, departmentCities])

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
          <DepartmentDistrictFilters
            departmentKey={departmentKey}
            district={city}
            onDepartmentKeyChange={setDepartmentKey}
            onDistrictChange={setCity}
          />
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
        <DepartmentDistrictFilters
          departmentKey={departmentKey}
          district={city}
          onDepartmentKeyChange={setDepartmentKey}
          onDistrictChange={setCity}
        />
      </div>
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <CategoryIcon categorySlug={categorySlug} subcategorySlug={subslug} size="xl" variant="muted" />
        <h2 className="text-xl font-bold text-foreground">Próximamente</h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {city.trim() || departmentKey.trim()
            ? "No hay negocios en esta subcategoría para la ubicación elegida. Probá otro departamento o distrito."
            : "Estamos agregando negocios en esta subcategoría. Volvé pronto."}
        </p>
      </div>
    </section>
  )
}
