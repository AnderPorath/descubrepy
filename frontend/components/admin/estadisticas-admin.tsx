"use client"

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Eye,
  Gift,
  Instagram,
  MessageCircle,
  Phone,
  Search,
  Share2,
  Star,
  Store,
  Ticket,
  Trophy,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  fetchAnalyticsBusinesses,
  fetchAnalyticsSummary,
  fetchAnalyticsTops,
  getImageUrl,
  type AnalyticsBusinessRow,
  type AnalyticsPeriod,
  type AnalyticsSummary,
  type AnalyticsTopItem,
} from "@/lib/api"
import { getOpenStatus } from "@/lib/opening-hours"
import {
  findDepartmentKeyForDistrict,
  getDepartmentName,
  getDistrictsForDepartment,
  PARAGUAY_DEPARTMENTS,
} from "@/lib/paraguay-departments"
import { cn } from "@/lib/utils"

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "year", label: "Este año" },
  { value: "custom", label: "Personalizado" },
]

const SORTS: { value: string; label: string }[] = [
  { value: "views", label: "Más visitas" },
  { value: "coupons", label: "Más cupones" },
  { value: "whatsapp", label: "Más WhatsApp" },
  { value: "instagram", label: "Más Instagram" },
  { value: "shares", label: "Más compartidos" },
  { value: "phone", label: "Más llamadas" },
]

function fmt(n: number) {
  return Math.round(n || 0).toLocaleString("es-PY")
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: number
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accent)}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-500">{label}</p>
          <p className="mt-0.5 text-2xl font-semibold tracking-tight text-neutral-900">
            {fmt(value)}
          </p>
        </div>
      </div>
    </div>
  )
}

function TopList({
  title,
  items,
}: {
  title: string
  items: AnalyticsTopItem[]
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">Sin datos en este período</p>
      ) : (
        <ol className="space-y-2">
          {items.map((item, i) => (
            <li key={item.id}>
              <Link
                href={`/estadisticas/${item.slug}`}
                className="flex items-center gap-3 rounded-xl px-1 py-1.5 transition hover:bg-neutral-50"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                  {i + 1}
                </span>
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  <Image
                    src={getImageUrl(item.image_url) || "/placeholder.svg"}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="32px"
                    unoptimized
                  />
                </div>
                <span className="min-w-0 flex-1 truncate text-sm text-neutral-800">
                  {item.name}
                </span>
                <span className="shrink-0 text-sm font-semibold text-neutral-900">
                  {fmt(item.count)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function EstadisticasAdmin({ token }: { token: string }) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [sort, setSort] = useState("views")
  const [q, setQ] = useState("")
  const [dept, setDept] = useState("all")
  const [district, setDistrict] = useState("all")
  const [category, setCategory] = useState("all")
  const [plan, setPlan] = useState("all")
  const [withDiscount, setWithDiscount] = useState("all")
  const [featured, setFeatured] = useState("all")

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [businesses, setBusinesses] = useState<AnalyticsBusinessRow[]>([])
  const [tops, setTops] = useState<{
    most_viewed: AnalyticsTopItem[]
    most_whatsapp: AnalyticsTopItem[]
    most_coupon_claims: AnalyticsTopItem[]
    most_coupon_used: AnalyticsTopItem[]
    most_shared: AnalyticsTopItem[]
    most_instagram: AnalyticsTopItem[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (period === "custom" && (!customFrom || !customTo)) return
    setLoading(true)
    setError(null)
    try {
      const from = period === "custom" ? customFrom : undefined
      const to = period === "custom" ? customTo : undefined
      const [s, b, t] = await Promise.all([
        fetchAnalyticsSummary(token, period, from, to),
        fetchAnalyticsBusinesses(token, { period, sort, from, to }),
        fetchAnalyticsTops(token, period, from, to),
      ])
      setSummary(s)
      setBusinesses(b.businesses || [])
      setTops(t.tops)
    } catch (e) {
      setSummary(null)
      setBusinesses([])
      setTops(null)
      setError(e instanceof Error ? e.message : "Error al cargar estadísticas")
    } finally {
      setLoading(false)
    }
  }, [token, period, sort, customFrom, customTo])

  useEffect(() => {
    void load()
  }, [load])

  const districts = useMemo(() => {
    if (dept === "all") return []
    return getDistrictsForDepartment(dept)
  }, [dept])

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const b of businesses) {
      if (b.category) set.add(b.category)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"))
  }, [businesses])

  const plans = useMemo(() => {
    const set = new Set<string>()
    for (const b of businesses) {
      if (b.plan) set.add(b.plan)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"))
  }, [businesses])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return businesses.filter((b) => {
      if (query && !b.name.toLowerCase().includes(query)) return false
      if (category !== "all" && b.category !== category) return false
      if (plan !== "all" && b.plan !== plan) return false
      if (withDiscount === "yes" && !(b.discount_percent > 0)) return false
      if (withDiscount === "no" && b.discount_percent > 0) return false
      if (featured === "yes" && !b.featured) return false
      if (featured === "no" && b.featured) return false

      const deptKey = findDepartmentKeyForDistrict(b.city || "")
      if (dept !== "all") {
        if (deptKey !== dept) return false
        if (district !== "all" && (b.city || "").trim() !== district) return false
      }
      return true
    })
  }, [businesses, q, category, plan, withDiscount, featured, dept, district])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Estadísticas
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Rendimiento de los negocios en DescubrePy
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">Período</Label>
            <Select
              value={period}
              onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}
            >
              <SelectTrigger className="w-[180px] rounded-xl bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {period === "custom" ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-500">Desde</Label>
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-[150px] rounded-xl bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-500">Hasta</Label>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-[150px] rounded-xl bg-white"
                />
              </div>
            </>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading && !summary ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <SummaryCard
              icon={Store}
              label="Total de negocios"
              value={summary?.total_businesses || 0}
              accent="bg-sky-50 text-sky-600"
            />
            <SummaryCard
              icon={Eye}
              label="Visitas a negocios"
              value={summary?.profile_views || 0}
              accent="bg-violet-50 text-violet-600"
            />
            <SummaryCard
              icon={Ticket}
              label="Cupones canjeados"
              value={summary?.coupon_claims || 0}
              accent="bg-amber-50 text-amber-600"
            />
            <SummaryCard
              icon={MessageCircle}
              label="Clics en WhatsApp"
              value={summary?.whatsapp_clicks || 0}
              accent="bg-emerald-50 text-emerald-600"
            />
            <SummaryCard
              icon={Phone}
              label="Llamadas"
              value={summary?.phone_clicks || 0}
              accent="bg-blue-50 text-blue-600"
            />
            <SummaryCard
              icon={Instagram}
              label="Clics en Instagram"
              value={summary?.instagram_clicks || 0}
              accent="bg-pink-50 text-pink-600"
            />
            <SummaryCard
              icon={Share2}
              label="Compartidos"
              value={summary?.share_clicks || 0}
              accent="bg-cyan-50 text-cyan-600"
            />
            <SummaryCard
              icon={Star}
              label="Negocios destacados"
              value={summary?.featured_businesses || 0}
              accent="bg-yellow-50 text-yellow-600"
            />
            <SummaryCard
              icon={Gift}
              label="Con descuentos activos"
              value={summary?.discount_businesses || 0}
              accent="bg-rose-50 text-rose-600"
            />
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Negocios</h2>
                <p className="text-sm text-neutral-500">
                  {fmt(filtered.length)} de {fmt(businesses.length)} negocios
                </p>
              </div>
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nombre…"
                  className="rounded-xl pl-9"
                />
              </div>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
              <Select
                value={dept}
                onValueChange={(v) => {
                  setDept(v)
                  setDistrict("all")
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los deptos.</SelectItem>
                  {PARAGUAY_DEPARTMENTS.map((d) => (
                    <SelectItem key={d.key} value={d.key}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={district}
                onValueChange={setDistrict}
                disabled={dept === "all"}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Distrito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los distritos</SelectItem>
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los planes</SelectItem>
                  {plans.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={withDiscount} onValueChange={setWithDiscount}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Descuento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Con/sin descuento</SelectItem>
                  <SelectItem value="yes">Con descuento</SelectItem>
                  <SelectItem value="no">Sin descuento</SelectItem>
                </SelectContent>
              </Select>

              <Select value={featured} onValueChange={setFeatured}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Destacado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Destacados / no</SelectItem>
                  <SelectItem value="yes">Destacados</SelectItem>
                  <SelectItem value="no">No destacados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-100">
              <table className="min-w-[1100px] w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-3 py-3 font-medium">Negocio</th>
                    <th className="px-3 py-3 font-medium">Categoría</th>
                    <th className="px-3 py-3 font-medium">Ubicación</th>
                    <th className="px-3 py-3 font-medium">Estado</th>
                    <th className="px-3 py-3 font-medium">Plan</th>
                    <th className="px-3 py-3 font-medium text-right">Visitas</th>
                    <th className="px-3 py-3 font-medium text-right">WA</th>
                    <th className="px-3 py-3 font-medium text-right">Llam.</th>
                    <th className="px-3 py-3 font-medium text-right">IG</th>
                    <th className="px-3 py-3 font-medium text-right">Share</th>
                    <th className="px-3 py-3 font-medium text-right">Cupones</th>
                    <th className="px-3 py-3 font-medium text-right">Usados</th>
                    <th className="px-3 py-3 font-medium text-right">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const deptKey = findDepartmentKeyForDistrict(b.city || "")
                    const deptName = deptKey ? getDepartmentName(deptKey) : "—"
                    const status = getOpenStatus(b.opening_hours)
                    return (
                      <tr
                        key={b.id}
                        className="border-t border-neutral-100 transition hover:bg-neutral-50/80"
                      >
                        <td className="px-3 py-2.5">
                          <Link
                            href={`/estadisticas/${b.slug}`}
                            className="flex items-center gap-3"
                          >
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                              <Image
                                src={getImageUrl(b.image_url) || "/placeholder.svg"}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="40px"
                                unoptimized
                              />
                            </div>
                            <span className="font-medium text-neutral-900 hover:underline">
                              {b.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-neutral-600">
                          {b.category || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-neutral-600">
                          <div className="leading-tight">
                            <div>{b.city || "—"}</div>
                            <div className="text-xs text-neutral-400">{deptName}</div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                              status.isOpen
                                ? "bg-emerald-50 text-emerald-700"
                                : status.hasSchedule
                                  ? "bg-neutral-100 text-neutral-600"
                                  : "bg-neutral-50 text-neutral-400"
                            )}
                          >
                            {status.hasSchedule
                              ? status.isOpen
                                ? "Abierto"
                                : "Cerrado"
                              : "Sin horario"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-neutral-600">{b.plan}</td>
                        <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                          {fmt(b.profile_views)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {fmt(b.whatsapp_clicks)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {fmt(b.phone_clicks)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {fmt(b.instagram_clicks)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {fmt(b.share_clicks)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {fmt(b.coupon_claims)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {fmt(b.coupon_used)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-neutral-900">
                          {b.conversion_rate}%
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={13}
                        className="px-3 py-10 text-center text-neutral-400"
                      >
                        No hay negocios con estos filtros
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          {tops ? (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Rankings Top 10
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <TopList title="Más visitados" items={tops.most_viewed} />
                <TopList title="Más WhatsApp" items={tops.most_whatsapp} />
                <TopList title="Más cupones reclamados" items={tops.most_coupon_claims} />
                <TopList title="Más cupones utilizados" items={tops.most_coupon_used} />
                <TopList title="Más compartidos" items={tops.most_shared} />
                <TopList title="Más Instagram" items={tops.most_instagram} />
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
