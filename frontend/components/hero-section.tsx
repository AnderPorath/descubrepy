"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Building2, MapPin, ChevronDown } from "lucide-react"
import { fetchCities, fetchStats } from "@/lib/api"

export function HeroSection() {
  const [query, setQuery] = useState("")
  const [city, setCity] = useState("Todas las ciudades")
  const [cityOpen, setCityOpen] = useState(false)
  const [cities, setCities] = useState<string[]>(["Todas las ciudades"])
  const [stats, setStats] = useState<{ businessCount: number; monthlyVisitors: number } | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCities().then((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setCities(["Todas las ciudades", ...list])
      }
    })
  }, [])

  useEffect(() => {
    fetchStats().then((data) => setStats(data))
  }, [])

  return (
    <section className="relative min-h-[70vh] overflow-hidden md:min-h-[75vh]">
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-10 pt-20 text-center md:pb-14 md:pt-24 lg:pb-16 lg:pt-28">
        {/* Badge */}
        <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
          Tu guia digital de Paraguay
        </span>

        {/* Heading - serif font */}
        <h1 className="text-balance font-[family-name:var(--font-heading)] text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
          Descubri los mejores negocios de Paraguay
        </h1>

        {/* Subtitle */}
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-white/70 md:text-base">
          Explora restaurantes, salones, tiendas y servicios. Todo lo que necesitas, en un solo lugar.
        </p>

        {/* Search bar */}
        <div className="mt-7 w-full max-w-2xl md:mt-8">
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row sm:items-center sm:gap-0">
            {/* City selector */}
            <div className="relative sm:border-r sm:border-neutral-200 sm:pr-2">
              <button
                type="button"
                onClick={() => setCityOpen(!cityOpen)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-3 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 sm:w-auto"
              >
                <MapPin className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="truncate">{city}</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform ${cityOpen ? "rotate-180" : ""}`} />
              </button>
              {cityOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 max-h-52 w-56 overflow-y-auto rounded-xl border border-neutral-100 bg-white py-1 shadow-lg">
                  {cities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCity(c)
                        setCityOpen(false)
                      }}
                      className={`w-full cursor-pointer px-4 py-2 text-left text-sm transition-colors hover:bg-neutral-50 ${
                        c === city ? "font-medium text-foreground" : "text-neutral-600"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca restaurantes, salones, gimnasios..."
                className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
              />
            </div>

            {/* Buscar button */}
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams()
                if (query.trim()) params.set("q", query.trim())
                if (city && city !== "Todas las ciudades") params.set("ciudad", city)
                router.push(`/negocios${params.toString() ? `?${params.toString()}` : ""}`)
              }}
              className="cursor-pointer rounded-xl bg-neutral-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Stats: negocios registrados (dato real de la API) */}
        <div className="mt-8">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm w-fit">
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
