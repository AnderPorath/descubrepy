"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { Tag, Layers } from "lucide-react"
import { BusinessCard } from "@/components/business-card"
import {
  fetchDiscounts,
  fetchCategories,
  fetchSubcategories,
  type BusinessApi,
  type CategoryApi,
  type SubcategoryApi,
} from "@/lib/api"
import { DepartmentDistrictFilters } from "@/components/department-district-filters"
import { getDistrictsForDepartment } from "@/lib/paraguay-departments"
import { sortBusinessesByOpenStatus } from "@/lib/opening-hours"
import { CouponRedeemDialog } from "@/components/coupon-redeem-dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const FALLBACK_CATEGORIES: CategoryApi[] = [
  { id: 1, slug: "gastronomia", title: "Gastronomía", description: null, icon_name: "UtensilsCross", business_count: 0 },
  { id: 2, slug: "belleza-y-spa", title: "Belleza y Spa", description: null, icon_name: "Scissors", business_count: 0 },
  { id: 3, slug: "salud", title: "Salud", description: null, icon_name: "Stethoscope", business_count: 0 },
  { id: 4, slug: "cafeterias", title: "Cafeterías", description: null, icon_name: "Coffee", business_count: 0 },
  { id: 5, slug: "fitness", title: "Fitness", description: null, icon_name: "Dumbbell", business_count: 0 },
]

export function DescuentosList() {
  const [items, setItems] = useState<BusinessApi[]>([])
  const [loading, setLoading] = useState(true)
  const [departmentKey, setDepartmentKey] = useState("")
  const [city, setCity] = useState("")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [categories, setCategories] = useState<CategoryApi[]>(FALLBACK_CATEGORIES)
  const [subcategories, setSubcategories] = useState<SubcategoryApi[]>([])
  const [couponOpen, setCouponOpen] = useState(false)
  const [couponBusiness, setCouponBusiness] = useState<BusinessApi | null>(null)

  const loadSubcategories = useCallback(async (categorySlug: string) => {
    if (!categorySlug.trim()) {
      setSubcategories([])
      return
    }
    const subs = await fetchSubcategories(categorySlug)
    setSubcategories(Array.isArray(subs) ? subs : [])
  }, [])

  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(Array.isArray(cats) && cats.length > 0 ? cats : FALLBACK_CATEGORIES)
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

  const departmentCities = useMemo(() => {
    if (city.trim()) return undefined
    if (!departmentKey.trim()) return undefined
    const list = getDistrictsForDepartment(departmentKey)
    return list.length > 0 ? list : undefined
  }, [city, departmentKey])

  useEffect(() => {
    setLoading(true)
    fetchDiscounts({
      city: city.trim() || undefined,
      cities: departmentCities,
      category: category.trim() || undefined,
      subcategory: subcategory.trim() || undefined,
    })
      .then((list) => setItems(sortBusinessesByOpenStatus(Array.isArray(list) ? list : [])))
      .finally(() => setLoading(false))
  }, [city, category, subcategory, departmentCities])

  if (loading && items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando descuentos…</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <div className="mb-8 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col flex-wrap items-stretch gap-4 min-[900px]:flex-row min-[900px]:flex-wrap min-[900px]:items-end min-[900px]:gap-3">
          <div className="flex min-w-0 w-full flex-col gap-4 min-[480px]:flex-row min-[480px]:flex-nowrap min-[480px]:items-end min-[480px]:gap-3 min-[900px]:w-auto min-[900px]:shrink-0">
            <DepartmentDistrictFilters
              departmentKey={departmentKey}
              district={city}
              onDepartmentKeyChange={setDepartmentKey}
              onDistrictChange={setCity}
              wrapClassName="flex flex-col gap-1.5 w-full min-[480px]:w-auto"
              departmentTriggerClassName="h-auto min-h-9 w-full min-w-0 whitespace-normal py-2 text-sm min-[480px]:min-w-[14rem] md:min-w-[18rem] lg:min-w-[20rem] [&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:whitespace-normal"
              districtTriggerClassName="h-auto min-h-9 w-full min-w-0 whitespace-normal py-2 text-sm min-[480px]:min-w-[15rem] md:min-w-[18rem] lg:min-w-[20rem] [&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:whitespace-normal"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5 min-[480px]:min-w-[12rem] min-[900px]:shrink-0">
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
              <SelectTrigger className="h-auto min-h-9 w-full min-w-0 py-2 text-sm min-[480px]:min-w-[12rem] md:min-w-[14rem] [&_[data-slot=select-value]]:line-clamp-none">
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
            <div className="flex min-w-0 flex-col gap-1.5 min-[480px]:shrink-0">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Subcategoría
              </Label>
              <Select
                value={subcategory || "all"}
                onValueChange={(v) => setSubcategory(v === "all" ? "" : v)}
              >
                <SelectTrigger className="h-auto min-h-9 w-full min-w-0 py-2 text-sm min-[480px]:min-w-[12rem] md:min-w-[16rem] [&_[data-slot=select-value]]:line-clamp-none">
                  <SelectValue placeholder="Todas las subcategorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las subcategorías</SelectItem>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.slug}>
                      {sub.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Tag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Aún no hay descuentos</h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {city || category || subcategory
              ? "No hay negocios con descuento para los filtros elegidos."
              : "Cuando cargues un porcentaje al registrar o editar un local, aparecerá acá."}
          </p>
          <Link href="/negocios" className="mt-2 text-sm font-medium text-primary hover:underline">
            Ver todos los negocios
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "local con descuento" : "locales con descuento"}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onRedeemClick={(selected) => {
                  setCouponBusiness(selected)
                  setCouponOpen(true)
                }}
              />
            ))}
          </div>
        </>
      )}

      <CouponRedeemDialog
        open={couponOpen}
        onOpenChange={setCouponOpen}
        businessName={couponBusiness?.name}
        couponUrl={couponBusiness?.discount_coupon_url}
        businessId={couponBusiness?.id}
        businessSlug={couponBusiness?.slug}
      />
    </section>
  )
}
