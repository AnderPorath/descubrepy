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

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-10 pt-20 text-center md:pb-14 md:pt-24 lg:max-w-7xl lg:pb-16 lg:pt-28">
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

        {/* Buscador: sin etiquetas encima; una sola barra alineada; ancho acorde al hero */}
        <div className="mt-8 w-full md:mt-10">
          <div className="rounded-2xl border border-white/30 bg-white/[0.97] p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] backdrop-blur-md sm:p-3.5 md:p-4">
            <div className="flex flex-col gap-2.5 min-[520px]:flex-row min-[520px]:flex-nowrap min-[520px]:items-center min-[520px]:gap-2">
              <div className="flex min-w-0 w-full flex-col gap-2 min-[400px]:flex-row min-[400px]:flex-nowrap min-[400px]:items-center min-[400px]:gap-2 min-[520px]:w-auto min-[520px]:shrink-0">
                <DepartmentDistrictFilters
                  departmentKey={departmentKey}
                  district={city}
                  onDepartmentKeyChange={setDepartmentKey}
                  onDistrictChange={setCity}
                  showLabels={false}
                  groupByRegion
                  wrapClassName="flex w-full min-w-0 min-[400px]:w-auto"
                  departmentTriggerClassName="h-11 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 shadow-sm min-[400px]:min-w-[11.5rem] sm:min-w-[13rem] md:min-w-[15rem] [&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:text-left"
                  districtTriggerClassName="h-11 w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 shadow-sm min-[400px]:min-w-[12.5rem] sm:min-w-[14rem] md:min-w-[17rem] lg:min-w-[19rem] [&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:text-left"
                />
              </div>
              <div className="relative min-h-11 min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="¿Qué buscás? Ej. pizzería, peluquería…"
                  aria-label="Buscar negocios"
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
                className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/92 hover:shadow-lg active:scale-[0.98] min-[520px]:w-auto min-[520px]:px-8"
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
