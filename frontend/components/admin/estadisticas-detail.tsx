"use client"

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Eye,
  Instagram,
  MessageCircle,
  Phone,
  Share2,
  Ticket,
} from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  fetchAnalyticsBusinessDetail,
  getImageUrl,
  type AnalyticsPeriod,
} from "@/lib/api"
import { cn } from "@/lib/utils"

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "year", label: "Este año" },
  { value: "custom", label: "Personalizado" },
]

function fmt(n: number) {
  return Math.round(n || 0).toLocaleString("es-PY")
}

function formatDate(s: string | null | undefined) {
  if (!s) return "—"
  try {
    return new Date(s).toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number)
  if (!y || !m) return ym
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString("es-PY", { month: "short", year: "2-digit" })
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
  suffix,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: number | string
  accent: string
  suffix?: string
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accent)}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-medium text-neutral-500">{label}</p>
          <p className="mt-0.5 text-2xl font-semibold tracking-tight text-neutral-900">
            {typeof value === "number" ? fmt(value) : value}
            {suffix ? <span className="text-base font-medium">{suffix}</span> : null}
          </p>
        </div>
      </div>
    </div>
  )
}

function MetricChart({
  title,
  dataKey,
  data,
  color,
}: {
  title: string
  dataKey: string
  data: Array<Record<string, string | number>>
  color: string
}) {
  const config: ChartConfig = {
    [dataKey]: { label: title, color },
  }

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-neutral-900">{title}</h3>
      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-400">
          Sin datos en este período
        </p>
      ) : (
        <ChartContainer config={config} className="aspect-[16/9] w-full">
          <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={36}
              fontSize={11}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={`var(--color-${dataKey})`}
              strokeWidth={2.5}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      )}
    </div>
  )
}

export function EstadisticasDetail({
  token,
  slug,
}: {
  token: string
  slug: string
}) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchAnalyticsBusinessDetail>
  > | null>(null)

  const load = useCallback(async () => {
    if (period === "custom" && (!customFrom || !customTo)) return
    setLoading(true)
    setError(null)
    try {
      const from = period === "custom" ? customFrom : undefined
      const to = period === "custom" ? customTo : undefined
      const result = await fetchAnalyticsBusinessDetail(slug, token, period, from, to)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar detalle")
    } finally {
      setLoading(false)
    }
  }, [token, slug, period, customFrom, customTo])

  useEffect(() => {
    void load()
  }, [load])

  const chartData = useMemo(() => {
    return (data?.monthly || []).map((row) => ({
      ...row,
      label: monthLabel(row.month),
    }))
  }, [data])

  if (loading && !data) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/estadisticas"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a estadísticas
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "No se encontró el negocio"}
        </div>
      </div>
    )
  }

  const { business, totals } = data

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/estadisticas"
            className="mb-3 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a estadísticas
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 shadow-sm">
              <Image
                src={getImageUrl(business.image_url) || "/placeholder.svg"}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                {business.name}
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                {business.category || "Sin categoría"} · Plan {business.plan}
              </p>
              <p className="text-xs text-neutral-400">
                Alta: {formatDate(business.created_at)}
              </p>
            </div>
          </div>
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Eye}
          label="Visitas al perfil"
          value={totals.profile_views}
          accent="bg-violet-50 text-violet-600"
        />
        <MetricCard
          icon={MessageCircle}
          label="Clics en WhatsApp"
          value={totals.whatsapp_clicks}
          accent="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          icon={Phone}
          label="Clics en Llamar"
          value={totals.phone_clicks}
          accent="bg-blue-50 text-blue-600"
        />
        <MetricCard
          icon={Instagram}
          label="Clics en Instagram"
          value={totals.instagram_clicks}
          accent="bg-pink-50 text-pink-600"
        />
        <MetricCard
          icon={Share2}
          label="Veces compartido"
          value={totals.share_clicks}
          accent="bg-cyan-50 text-cyan-600"
        />
        <MetricCard
          icon={Ticket}
          label="Cupones canjeados"
          value={totals.coupon_claims}
          accent="bg-amber-50 text-amber-600"
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          Evolución mensual
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <MetricChart
            title="Visitas por mes"
            dataKey="profile_views"
            data={chartData}
            color="#7c3aed"
          />
          <MetricChart
            title="Cupones por mes"
            dataKey="coupon_claims"
            data={chartData}
            color="#d97706"
          />
          <MetricChart
            title="WhatsApp por mes"
            dataKey="whatsapp_clicks"
            data={chartData}
            color="#059669"
          />
          <MetricChart
            title="Instagram por mes"
            dataKey="instagram_clicks"
            data={chartData}
            color="#db2777"
          />
          <MetricChart
            title="Llamadas por mes"
            dataKey="phone_clicks"
            data={chartData}
            color="#2563eb"
          />
          <MetricChart
            title="Compartidos por mes"
            dataKey="share_clicks"
            data={chartData}
            color="#0891b2"
          />
        </div>
      </div>
    </div>
  )
}
