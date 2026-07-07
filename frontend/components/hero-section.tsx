"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Store,
  Sparkles,
  UtensilsCrossed,
  Coffee,
  Dumbbell,
  ShoppingBag,
} from "lucide-react"
import { fetchStats } from "@/lib/api"
import { canonicalizeDistrictName } from "@/lib/paraguay-departments"
import { DepartmentDistrictFilters } from "@/components/department-district-filters"

const COLLAGE_BG = [
  "/images/hero-bg-v2.png",
  "/images/hero-bg-v3.png",
  "/images/hero-bg-v4.png",
  "/images/hero-bg-v5.png",
  "/images/hero-bg-v6.png",
]

const QUICK_CATEGORIES_LEFT = [
  { label: "RESTAURANTES", href: "/categorias/gastronomia?from=inicio", icon: UtensilsCrossed },
  { label: "CAFETERÍAS", href: "/categorias/gastronomia?from=inicio", icon: Coffee },
] as const

const QUICK_CATEGORIES_RIGHT = [
  { label: "GIMNASIOS", href: "/categorias/fitness?from=inicio", icon: Dumbbell },
  { label: "TIENDAS Y MÁS", href: "/categorias/moda?from=inicio", icon: ShoppingBag },
] as const

const heroSelectClass =
  "h-12 w-full min-w-0 border-0 bg-transparent px-2 shadow-none focus:ring-0 focus-visible:ring-0 [&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:text-left sm:min-w-[9.5rem] md:min-w-[11rem] lg:min-w-[12.5rem]"

export function HeroSection() {
  const [query, setQuery] = useState("")
  const [departmentKey, setDepartmentKey] = useState("")
  const [city, setCity] = useState("")
  const [stats, setStats] = useState<{ businessCount: number; monthlyVisitors: number } | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchStats().then((data) => setStats(data))
  }, [])

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    const c = city.trim()
    if (c) {
      params.set("ciudad", canonicalizeDistrictName(c))
    } else if (departmentKey.trim()) {
      params.set("departamento", departmentKey.trim())
    }
    router.push(`/negocios${params.toString() ? `?${params.toString()}` : ""}`)
  }, [query, city, departmentKey, router])

  return (
    <section className="relative min-h-[78vh] overflow-hidden md:min-h-[88vh]">
      {/* Collage de fondo */}
      <div className="absolute inset-0 flex">
        {COLLAGE_BG.map((src, i) => (
          <div
            key={src}
            className="relative min-w-0 flex-1 bg-cover bg-center"
            style={{
              backgroundImage: `url('${src}')`,
              marginLeft: i > 0 ? "-1.5%" : undefined,
              zIndex: i,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/75" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-28 pt-16 text-center md:pb-32 md:pt-20 lg:max-w-7xl lg:pt-24">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm sm:text-[11px]">
          🇵🇾 Tu guía digital de Paraguay
        </span>

        <h1 className="text-balance font-[family-name:var(--font-heading)] text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.35rem]">
          Descubrí los mejores negocios de{" "}
          <span className="inline-block">
            <span className="text-[#E52B2B]">Par</span>
            <span className="text-white">agu</span>
            <span className="text-[#0038A8]">ay</span>
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-white/75 md:text-base lg:text-lg">
          Encontrá nuevos lugares,{" "}
          <span className="font-semibold text-amber-300">descuentos</span> y negocios increíbles cerca
          tuyo.
        </p>

        {/* Barra de búsqueda unificada */}
        <div className="mt-8 w-full max-w-5xl md:mt-10">
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] md:rounded-full md:p-1.5">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex min-w-0 flex-col border-b border-neutral-100 sm:flex-row md:border-b-0 md:border-r">
                <DepartmentDistrictFilters
                  departmentKey={departmentKey}
                  district={city}
                  onDepartmentKeyChange={setDepartmentKey}
                  onDistrictChange={setCity}
                  showLabels={false}
                  showTriggerIcon
                  layout="row"
                  groupByRegion
                  filtersRowClassName="flex w-full min-w-0 flex-col sm:flex-row sm:items-stretch"
                  wrapClassName="flex min-w-0 w-full sm:w-auto"
                  departmentTriggerClassName={`${heroSelectClass} sm:border-r sm:border-neutral-100`}
                  districtTriggerClassName={heroSelectClass}
                />
              </div>

              <div className="relative min-h-12 min-w-0 flex-1 border-b border-neutral-100 md:border-b-0 md:border-r">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch()
                  }}
                  placeholder="¿Qué buscás? Ej. pizzería, peluquería, gimnasio…"
                  aria-label="Buscar negocios"
                  className="h-12 w-full bg-transparent py-2 pl-11 pr-4 text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 bg-primary px-8 text-sm font-semibold text-primary-foreground transition hover:bg-primary/92 active:scale-[0.99] md:w-auto md:rounded-full md:px-10"
              >
                <Search className="h-4 w-4" />
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Categorías rápidas + estadísticas */}
        <div className="mt-8 flex w-full max-w-5xl flex-col items-center gap-4 lg:mt-10">
          <div className="flex w-full flex-col items-center justify-center gap-4 lg:flex-row lg:gap-5">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {QUICK_CATEGORIES_LEFT.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[10px] font-semibold tracking-wide text-white/90 backdrop-blur-sm transition hover:bg-black/50 sm:text-[11px]"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-white/70" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-black/40 px-5 py-3.5 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/90">
                <Store className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold leading-none text-white">
                  {stats ? stats.businessCount : "—"}
                </p>
                <p className="mt-1 text-[11px] leading-tight text-white/65">
                  Negocios registrados
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/50">
                  Y seguimos creciendo
                  <Sparkles className="h-3 w-3 text-amber-300/80" />
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {QUICK_CATEGORIES_RIGHT.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[10px] font-semibold tracking-wide text-white/90 backdrop-blur-sm transition hover:bg-black/50 sm:text-[11px]"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-white/70" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Onda de transición */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 leading-none">
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="block h-14 w-full fill-white sm:h-20 md:h-24"
          aria-hidden
        >
          <path d="M0,48 C360,96 720,0 1080,48 C1260,72 1380,64 1440,56 L1440,100 L0,100 Z" />
        </svg>
      </div>
    </section>
  )
}
