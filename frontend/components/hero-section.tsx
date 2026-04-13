"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Building2, Sparkles } from "lucide-react"
import { fetchStats } from "@/lib/api"
import { canonicalizeDistrictName } from "@/lib/paraguay-departments"
import { DepartmentDistrictFilters } from "@/components/department-district-filters"

export function HeroSection() {
  const [query, setQuery] = useState("")
  const [departmentKey, setDepartmentKey] = useState("")
  const [city, setCity] = useState("")
  const [stats, setStats] = useState<{ businessCount: number; monthlyVisitors: number } | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchStats().then((data) => setStats(data))
  }, [])

  return (
    <section className="relative min-h-[64vh] overflow-hidden md:min-h-[72vh]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/py.png')" }}
      >
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-10 pt-20 text-center md:pb-14 md:pt-24 lg:pb-16 lg:pt-28">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
          <Sparkles className="h-3 w-3 text-amber-200/90" />
          Tu guía digital de Paraguay
        </span>

        <h1 className="text-balance font-[family-name:var(--font-heading)] text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
          Descubrí los mejores negocios de Paraguay
        </h1>

        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-white/70 md:text-base">
          Explorá restaurantes, salones, tiendas y servicios. Todo lo que necesitás, en un solo lugar.
        </p>

        {/* Buscador: departamento, distrito, texto y botón en una sola fila (con wrap solo en pantallas muy estrechas) */}
        <div className="mt-8 w-full max-w-5xl md:mt-10">
          <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/[0.97] p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] backdrop-blur-md md:p-5">
            <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:flex-nowrap lg:items-end lg:gap-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2 lg:shrink-0">
                <DepartmentDistrictFilters
                  departmentKey={departmentKey}
                  district={city}
                  onDepartmentKeyChange={setDepartmentKey}
                  onDistrictChange={setCity}
                  groupByRegion
                  labelClassName="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 flex items-center gap-1.5"
                  wrapClassName="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[min(100%,11rem)]"
                  departmentTriggerClassName="h-11 w-full min-w-0 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 shadow-sm sm:min-w-[10.5rem]"
                  districtTriggerClassName="h-11 w-full min-w-0 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 shadow-sm sm:min-w-[12rem]"
                />
              </div>
              <div className="relative min-h-[44px] min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="¿Qué buscás? Ej. pizzería, peluquería, gimnasio…"
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/90 py-2 pl-10 pr-4 text-sm text-neutral-800 shadow-inner outline-none transition placeholder:text-neutral-400 focus:border-primary/45 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams()
                  if (query.trim()) params.set("q", query.trim())
                  const c = city.trim()
                  if (c) params.set("ciudad", canonicalizeDistrictName(c))
                  router.push(`/negocios${params.toString() ? `?${params.toString()}` : ""}`)
                }}
                className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/92 hover:shadow-lg active:scale-[0.98] lg:w-auto lg:px-8"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-sm">
            <Building2 className="h-4 w-4 shrink-0 text-white/60" />
            <div className="text-left">
              <p className="text-base font-bold leading-tight text-white">
                {stats ? stats.businessCount : "—"}
              </p>
              <p className="text-[11px] text-white/60">Negocios registrados</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
