"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
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

const HERO_BG = "/images/hero-inicio-v4.jpg"

const QUICK_CATEGORIES_LEFT = [
  { label: "RESTAURANTES", href: "/categorias/gastronomia?from=inicio", icon: UtensilsCrossed },
  { label: "CAFETERÍAS", href: "/categorias/gastronomia?from=inicio", icon: Coffee },
] as const

const QUICK_CATEGORIES_RIGHT = [
  { label: "GIMNASIOS", href: "/categorias/fitness?from=inicio", icon: Dumbbell },
  { label: "TIENDAS Y MÁS", href: "/categorias/moda?from=inicio", icon: ShoppingBag },
] as const

const heroSelectClass =
  "!w-full min-w-0 border-0 bg-transparent px-3 shadow-none focus:ring-0 focus-visible:ring-0 [&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:whitespace-normal [&_[data-slot=select-value]]:text-left h-12 text-sm font-medium text-neutral-700"

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
    <section className="relative isolate min-h-[70vh] overflow-hidden md:min-h-[80vh]">
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/45 via-black/25 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-28 bg-gradient-to-t from-white via-white/95 to-transparent sm:h-32" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-16 pt-14 text-center sm:px-6 md:pb-20 md:pt-16 lg:max-w-7xl lg:pb-24 lg:pt-20">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm sm:text-[11px]">
          🇵🇾 Tu guía digital de Paraguay
        </span>

        <h1 className="max-w-4xl text-balance font-[family-name:var(--font-heading)] text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
          Descubrí los mejores negocios de{" "}
          <span className="inline-block">
            <span className="text-[#E52B2B]">Par</span>
            <span className="text-white">agu</span>
            <span className="text-[#0038A8]">ay</span>
          </span>
        </h1>

        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-white/75 md:mt-4 md:text-base lg:text-lg">
          Encontrá nuevos lugares,{" "}
          <span className="font-semibold text-amber-300">descuentos</span> y negocios increíbles cerca
          tuyo.
        </p>

        {/* Barra de búsqueda */}
        <div className="mt-7 w-full max-w-5xl md:mt-9">
          <div className="rounded-2xl border border-white/50 bg-white/95 p-2 shadow-[0_12px_48px_-8px_rgba(0,0,0,0.35)] backdrop-blur-md sm:rounded-[2rem] sm:p-2.5">
            <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-0">
              <DepartmentDistrictFilters
                departmentKey={departmentKey}
                district={city}
                onDepartmentKeyChange={setDepartmentKey}
                onDistrictChange={setCity}
                showLabels={false}
                showTriggerIcon
                layout="row"
                groupByRegion
                filtersRowClassName="grid w-full shrink-0 grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-0 lg:w-[min(100%,30rem)] lg:gap-0 lg:pr-1"
                wrapClassName="flex min-w-0 w-full rounded-xl bg-neutral-50/80 px-1 lg:rounded-full lg:bg-transparent lg:px-0"
                departmentTriggerClassName={`${heroSelectClass} lg:rounded-l-full lg:rounded-r-none lg:bg-neutral-50/80 lg:pl-4`}
                districtTriggerClassName={`${heroSelectClass} lg:rounded-none lg:bg-neutral-50/80`}
              />

              <div className="relative min-h-12 min-w-0 flex-1 lg:mx-1">
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
                  className="h-12 w-full rounded-xl bg-neutral-50/80 py-2 pl-11 pr-4 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-primary/15 lg:rounded-full lg:bg-neutral-50/80"
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] lg:w-auto lg:min-w-[9.5rem] lg:rounded-full lg:px-9"
              >
                <Search className="h-4 w-4" />
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Categorías rápidas + estadísticas */}
        <div className="mt-7 w-full max-w-5xl md:mt-9">
          <div className="flex flex-col items-center justify-center gap-4 xl:flex-row xl:gap-5">
            <div className="flex flex-wrap items-center justify-center gap-2">
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

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-black/40 px-5 py-3 backdrop-blur-md">
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

            <div className="flex flex-wrap items-center justify-center gap-2">
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
    </section>
  )
}
