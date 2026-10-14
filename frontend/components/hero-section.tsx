"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import {
  Search,
  Store,
  Sparkles,
  UtensilsCrossed,
  Coffee,
  Dumbbell,
  ShoppingBag,
  ChevronDown,
} from "lucide-react"
import { fetchStats } from "@/lib/api"
import { canonicalizeDistrictName } from "@/lib/paraguay-departments"
import { DepartmentDistrictFilters } from "@/components/department-district-filters"
import { CountUp, Magnetic } from "@/components/motion/primitives"

const HERO_BG = "/images/hero-inicio-v8.jpg"

const QUICK_CATEGORIES_LEFT = [
  { label: "RESTAURANTES", href: "/categorias/gastronomia?from=inicio", icon: UtensilsCrossed },
  { label: "CAFETERÍAS", href: "/categorias/gastronomia?from=inicio", icon: Coffee },
] as const

const QUICK_CATEGORIES_RIGHT = [
  { label: "GIMNASIOS", href: "/categorias/fitness?from=inicio", icon: Dumbbell },
  { label: "TIENDAS Y MÁS", href: "/categorias/moda?from=inicio", icon: ShoppingBag },
] as const

const ROTATING_WORDS = ["negocios", "sabores", "descuentos", "lugares", "servicios"]

const heroSelectClass =
  "!w-full min-w-0 border-0 bg-transparent px-3 shadow-none focus:ring-0 focus-visible:ring-0 [&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:whitespace-normal [&_[data-slot=select-value]]:text-left h-12 text-sm font-medium text-neutral-700"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.8, delay, ease: EASE_OUT },
})

function RotatingWord() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % ROTATING_WORDS.length), 2600)
    return () => window.clearInterval(id)
  }, [reduce])

  return (
    <span className="relative inline-grid align-bottom">
      {/* Reserva el ancho de la palabra más larga para que el título no salte */}
      {ROTATING_WORDS.map((w) => (
        <span key={w} aria-hidden className="invisible col-start-1 row-start-1">
          {w}
        </span>
      ))}
      <span className="col-start-1 row-start-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={ROTATING_WORDS[index]}
            className="inline-block bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent"
            initial={{ y: "100%", opacity: 0, rotateX: -70 }}
            animate={{ y: "0%", opacity: 1, rotateX: 0 }}
            exit={{ y: "-100%", opacity: 0, rotateX: 70 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            {ROTATING_WORDS[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}

function QuickChip({
  label,
  href,
  icon: Icon,
  delay,
}: {
  label: string
  href: string
  icon: (typeof QUICK_CATEGORIES_LEFT)[number]["icon"]
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT }}
      whileHover={{ y: -3, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link
        href={href}
        className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[10px] font-semibold tracking-wide text-white/90 backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-black/55 sm:text-[11px]"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-white/70 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 group-hover:text-amber-300" />
        {label}
      </Link>
    </motion.div>
  )
}

export function HeroSection() {
  const [query, setQuery] = useState("")
  const [departmentKey, setDepartmentKey] = useState("")
  const [city, setCity] = useState("")
  const [stats, setStats] = useState<{ businessCount: number; monthlyVisitors: number } | null>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const router = useRouter()
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const bgX = useSpring(useTransform(mx, [-1, 1], [18, -18]), { stiffness: 60, damping: 20 })
  const bgY = useSpring(useTransform(my, [-1, 1], [12, -12]), { stiffness: 60, damping: 20 })
  const orbX = useSpring(useTransform(mx, [-1, 1], [-40, 40]), { stiffness: 40, damping: 18 })
  const orbY = useSpring(useTransform(my, [-1, 1], [-30, 30]), { stiffness: 40, damping: 18 })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const bgScrollY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

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
    <section
      ref={sectionRef}
      className="relative isolate min-h-[70vh] overflow-hidden md:min-h-[80vh]"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1)
        my.set(((e.clientY - r.top) / r.height) * 2 - 1)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      <motion.div className="absolute -inset-8 z-0" style={{ x: bgX, y: bgY }}>
        <motion.div className="absolute inset-0" style={{ y: bgScrollY }}>
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.4, ease: EASE_OUT }}
          >
            <Image
              src={HERO_BG}
              alt=""
              fill
              priority
              quality={100}
              sizes="100vw"
              unoptimized
              className="object-cover object-[center_35%] sm:object-center"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Auroras con los colores de la bandera */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{ x: orbX, y: orbY }}>
        <motion.div
          className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#E52B2B]/35 blur-[90px] md:h-96 md:w-96"
          animate={reduce ? undefined : { x: [0, 60, -20, 0], y: [0, 30, 60, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-[#0038A8]/45 blur-[90px] md:h-[28rem] md:w-[28rem]"
          animate={reduce ? undefined : { x: [0, -50, 20, 0], y: [0, 50, -20, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-amber-300/20 blur-[80px]"
          animate={reduce ? undefined : { x: [0, 40, -40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/45 via-black/20 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-28 bg-gradient-to-t from-white via-white/95 to-transparent sm:h-32" />

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-16 pt-14 text-center sm:px-6 md:pb-20 md:pt-16 lg:max-w-7xl lg:pb-24 lg:pt-20"
      >
        <motion.span
          {...enter(0.1)}
          className="relative mb-4 inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm sm:text-[11px]"
        >
          <motion.span
            aria-hidden
            className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={reduce ? undefined : { x: ["0%", "400%"] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
          />
          🇵🇾 Tu guía digital de Paraguay
        </motion.span>

        <motion.h1
          {...enter(0.25)}
          className="max-w-4xl text-balance font-[family-name:var(--font-heading)] text-3xl font-bold leading-[1.15] tracking-tight text-white [perspective:600px] sm:text-4xl md:text-5xl lg:text-[3.25rem]"
        >
          Descubrí los mejores <RotatingWord /> de{" "}
          <span className="inline-block">
            <span className="text-[#E52B2B]">Par</span>
            <span className="text-white">agu</span>
            <span className="text-[#0038A8]">ay</span>
          </span>
        </motion.h1>

        <motion.p
          {...enter(0.4)}
          className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-white/75 md:mt-4 md:text-base lg:text-lg"
        >
          Encontrá nuevos lugares,{" "}
          <span className="font-semibold text-amber-300">descuentos</span> y negocios increíbles cerca
          tuyo.
        </motion.p>

        {/* Barra de búsqueda */}
        <motion.div {...enter(0.55)} className="relative mt-7 w-full max-w-5xl md:mt-9">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-[3px] rounded-[1.15rem] bg-[conic-gradient(from_var(--a),#E52B2B,#ffffff,#0038A8,#fbbf24,#E52B2B)] opacity-0 blur-[2px] sm:rounded-[2.15rem]"
            animate={{ opacity: searchFocused ? 0.9 : 0 }}
            transition={{ duration: 0.35 }}
            style={{ animation: "hero-spin 4s linear infinite" }}
          />
          <div
            className="relative rounded-2xl border border-white/50 bg-white/95 p-2 shadow-[0_12px_48px_-8px_rgba(0,0,0,0.35)] backdrop-blur-md sm:rounded-[2rem] sm:p-2.5"
            onFocusCapture={() => setSearchFocused(true)}
            onBlurCapture={() => setSearchFocused(false)}
          >
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

              <Magnetic className="w-full lg:w-auto" strength={0.25}>
                <motion.button
                  type="button"
                  onClick={handleSearch}
                  whileTap={{ scale: 0.96 }}
                  className="group relative inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-shadow hover:shadow-lg hover:shadow-primary/40 lg:w-auto lg:min-w-[9.5rem] lg:rounded-full lg:px-9"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                  <Search className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  Buscar
                </motion.button>
              </Magnetic>
            </div>
          </div>
        </motion.div>

        {/* Categorías rápidas + estadísticas */}
        <div className="mt-7 w-full max-w-5xl md:mt-9">
          <div className="flex flex-col items-center justify-center gap-4 xl:flex-row xl:gap-5">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {QUICK_CATEGORIES_LEFT.map((c, i) => (
                <QuickChip key={c.label} {...c} delay={0.75 + i * 0.08} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.9, ease: EASE_OUT }}
              whileHover={{ scale: 1.03 }}
              className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-black/40 px-5 py-3 backdrop-blur-md"
            >
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/90"
                animate={reduce ? undefined : { rotate: [0, -8, 8, 0] }}
                transition={{ duration: 1.2, delay: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                <Store className="h-5 w-5 text-accent-foreground" />
              </motion.div>
              <div className="text-left">
                <p className="text-xl font-bold leading-none text-white">
                  {stats ? <CountUp value={stats.businessCount} /> : "—"}
                </p>
                <p className="mt-1 text-[11px] leading-tight text-white/65">
                  Negocios registrados
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/50">
                  Y seguimos creciendo
                  <motion.span
                    animate={reduce ? undefined : { rotate: [0, 180, 360], scale: [1, 1.3, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex"
                  >
                    <Sparkles className="h-3 w-3 text-amber-300/80" />
                  </motion.span>
                </p>
              </div>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {QUICK_CATEGORIES_RIGHT.map((c, i) => (
                <QuickChip key={c.label} {...c} delay={0.85 + i * 0.08} />
              ))}
            </div>
          </div>
        </div>

        <motion.a
          href="#categorias"
          aria-label="Ver categorías"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-10 hidden flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500 md:flex"
        >
          Explorá
          <motion.span
            animate={reduce ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </motion.a>
      </motion.div>
    </section>
  )
}
