"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  History,
  Pencil,
  Search,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  fetchAdminPayments,
  fetchPaymentHistory,
  markPaymentPaid,
  updateBusinessMonthlyAmount,
  upsertPaymentMonth,
  type PaymentBusinessRow,
  type PaymentHistoryItem,
  type PaymentMonthCell,
  type PaymentMonthStatus,
  type PaymentsDashboard,
} from "@/lib/api"
import {
  findDepartmentKeyForDistrict,
  getDepartmentName,
  getDepartmentsGrouped,
  getDistrictsForDepartment,
  PARAGUAY_DEPARTMENTS,
} from "@/lib/paraguay-departments"
import { cn } from "@/lib/utils"

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]

const MONTH_FULL = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const STATUS_META: Record<
  PaymentMonthStatus,
  { label: string; className: string; dot: string }
> = {
  pagado: {
    label: "Pagado",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  pendiente: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-900 border-amber-200",
    dot: "bg-amber-400",
  },
  vencido: {
    label: "Vencido",
    className: "bg-red-100 text-red-800 border-red-200",
    dot: "bg-red-500",
  },
  no_corresponde: {
    label: "No corresponde",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
    dot: "bg-neutral-300",
  },
}

const PAYMENT_METHODS = [
  { value: "transferencia", label: "Transferencia" },
  { value: "efectivo", label: "Efectivo" },
  { value: "qr", label: "QR" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "otro", label: "Otro" },
]

function formatGs(n: number) {
  return `${Math.round(n || 0).toLocaleString("es-PY")} Gs`
}

function formatDate(s: string | null | undefined) {
  if (!s) return "—"
  try {
    return new Date(s).toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

type SortKey = "pendientes" | "vencidos" | "pagados" | "nombre" | "monto"

type TreeDept = {
  key: string
  name: string
  districts: { name: string; businesses: PaymentBusinessRow[] }[]
}

export function PagosAdmin({ token }: { token: string }) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [data, setData] = useState<PaymentsDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState("")
  const [deptFilter, setDeptFilter] = useState("all")
  const [districtFilter, setDistrictFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("pendientes")

  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({})
  const [expandedDistricts, setExpandedDistricts] = useState<Record<string, boolean>>({})

  const [monthModal, setMonthModal] = useState<{
    business: PaymentBusinessRow
    cell: PaymentMonthCell
  } | null>(null)
  const [amountModal, setAmountModal] = useState<PaymentBusinessRow | null>(null)
  const [historyModal, setHistoryModal] = useState<PaymentBusinessRow | null>(null)
  const [history, setHistory] = useState<PaymentHistoryItem[]>([])
  const [saving, setSaving] = useState(false)

  const [formAmount, setFormAmount] = useState("")
  const [formStatus, setFormStatus] = useState<PaymentMonthStatus>("pendiente")
  const [formDate, setFormDate] = useState("")
  const [formMethod, setFormMethod] = useState("transferencia")
  const [formNotes, setFormNotes] = useState("")
  const [formPlan, setFormPlan] = useState("Estándar")
  const [formMonthly, setFormMonthly] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAdminPayments(token, year)
      setData(res)
      // Expand first departments by default
      const next: Record<string, boolean> = {}
      for (const b of res.businesses) {
        const key = findDepartmentKeyForDistrict(b.city) || "otros"
        next[key] = true
      }
      setExpandedDepts((prev) => (Object.keys(prev).length ? prev : next))
    } catch {
      setError("No se pudieron cargar los pagos.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [token, year])

  useEffect(() => {
    load()
  }, [load])

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const b of data?.businesses || []) {
      if (b.category) set.add(b.category)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [data])

  const plans = useMemo(() => {
    const set = new Set<string>()
    for (const b of data?.businesses || []) {
      if (b.plan) set.add(b.plan)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [data])

  const districtOptions = useMemo(() => {
    if (deptFilter === "all") return []
    return getDistrictsForDepartment(deptFilter)
  }, [deptFilter])

  const focusMonth = data?.now?.year === year ? data.now.month : 12

  const filteredBusinesses = useMemo(() => {
    let list = [...(data?.businesses || [])]

    if (q.trim()) {
      const term = q.trim().toLowerCase()
      list = list.filter((b) => b.name.toLowerCase().includes(term))
    }
    if (deptFilter !== "all") {
      list = list.filter((b) => findDepartmentKeyForDistrict(b.city) === deptFilter)
    }
    if (districtFilter !== "all") {
      list = list.filter((b) => b.city === districtFilter)
    }
    if (categoryFilter !== "all") {
      list = list.filter((b) => b.category === categoryFilter)
    }
    if (planFilter !== "all") {
      list = list.filter((b) => b.plan === planFilter)
    }
    if (statusFilter !== "all") {
      list = list.filter((b) => {
        const cell = b.months.find((m) => m.month === focusMonth)
        return cell?.status === statusFilter
      })
    }

    const rank = (b: PaymentBusinessRow) => {
      const cell = b.months.find((m) => m.month === focusMonth)
      const s = cell?.status
      if (s === "vencido") return 0
      if (s === "pendiente") return 1
      if (s === "pagado") return 2
      return 3
    }

    list.sort((a, b) => {
      if (sortKey === "nombre") return a.name.localeCompare(b.name)
      if (sortKey === "monto") return (b.monthly_amount || 0) - (a.monthly_amount || 0)
      if (sortKey === "pagados") {
        const sa = a.months.find((m) => m.month === focusMonth)?.status === "pagado" ? 0 : 1
        const sb = b.months.find((m) => m.month === focusMonth)?.status === "pagado" ? 0 : 1
        if (sa !== sb) return sa - sb
        return a.name.localeCompare(b.name)
      }
      if (sortKey === "vencidos") {
        const sa = a.months.find((m) => m.month === focusMonth)?.status === "vencido" ? 0 : 1
        const sb = b.months.find((m) => m.month === focusMonth)?.status === "vencido" ? 0 : 1
        if (sa !== sb) return sa - sb
        return a.name.localeCompare(b.name)
      }
      // pendientes primero (luego vencidos)
      const ra = rank(a)
      const rb = rank(b)
      // pendientes first: swap pendiente/vencido order for this sort
      const mapPend = (r: number) => (r === 1 ? 0 : r === 0 ? 1 : r)
      const pa = mapPend(ra)
      const pb = mapPend(rb)
      if (pa !== pb) return pa - pb
      return a.name.localeCompare(b.name)
    })

    return list
  }, [
    data,
    q,
    deptFilter,
    districtFilter,
    categoryFilter,
    planFilter,
    statusFilter,
    sortKey,
    focusMonth,
  ])

  const tree: TreeDept[] = useMemo(() => {
    const map = new Map<string, Map<string, PaymentBusinessRow[]>>()
    for (const b of filteredBusinesses) {
      const deptKey = findDepartmentKeyForDistrict(b.city) || "otros"
      const district = b.city?.trim() || "Sin distrito"
      if (!map.has(deptKey)) map.set(deptKey, new Map())
      const dm = map.get(deptKey)!
      if (!dm.has(district)) dm.set(district, [])
      dm.get(district)!.push(b)
    }

    const depts: TreeDept[] = []
    for (const dept of PARAGUAY_DEPARTMENTS) {
      const dm = map.get(dept.key)
      if (!dm || dm.size === 0) continue
      depts.push({
        key: dept.key,
        name: dept.name,
        districts: [...dm.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([name, businesses]) => ({ name, businesses })),
      })
    }
    const otros = map.get("otros")
    if (otros && otros.size > 0) {
      depts.push({
        key: "otros",
        name: "Otros / sin ubicar",
        districts: [...otros.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([name, businesses]) => ({ name, businesses })),
      })
    }
    return depts
  }, [filteredBusinesses])

  const yearOptions = useMemo(() => {
    const base = data?.now?.year || currentYear
    return [base - 1, base, base + 1, base + 2, base + 3]
  }, [data, currentYear])

  const openMonth = (business: PaymentBusinessRow, cell: PaymentMonthCell) => {
    setMonthModal({ business, cell })
    setFormAmount(String(cell.amount || business.monthly_amount || 0))
    setFormStatus(cell.status === "vencido" && !cell.id ? "pendiente" : cell.status)
    setFormDate(cell.payment_date ? String(cell.payment_date).slice(0, 10) : "")
    setFormMethod(cell.payment_method || "transferencia")
    setFormNotes(cell.notes || "")
  }

  const openAmount = (business: PaymentBusinessRow) => {
    setAmountModal(business)
    setFormMonthly(String(business.monthly_amount || 0))
    setFormPlan(business.plan || "Estándar")
  }

  const openHistory = async (business: PaymentBusinessRow) => {
    setHistoryModal(business)
    const items = await fetchPaymentHistory(business.id, token)
    setHistory(items)
  }

  const saveMonth = async () => {
    if (!monthModal) return
    setSaving(true)
    const { error: err } = await upsertPaymentMonth(
      {
        business_id: monthModal.business.id,
        year,
        month: monthModal.cell.month,
        amount: Number(formAmount) || 0,
        status: formStatus,
        payment_date: formDate || null,
        payment_method: formMethod,
        notes: formNotes || null,
      },
      token
    )
    setSaving(false)
    if (err) {
      alert(err)
      return
    }
    setMonthModal(null)
    await load()
  }

  const saveAmount = async () => {
    if (!amountModal) return
    setSaving(true)
    const { error: err } = await updateBusinessMonthlyAmount(
      amountModal.id,
      { monthly_amount: Number(formMonthly) || 0, plan: formPlan },
      token
    )
    setSaving(false)
    if (err) {
      alert(err)
      return
    }
    setAmountModal(null)
    await load()
  }

  const quickMarkPaid = async (business: PaymentBusinessRow) => {
    const { error: err } = await markPaymentPaid(
      { business_id: business.id, year, month: focusMonth },
      token
    )
    if (err) {
      alert(err)
      return
    }
    await load()
  }

  const toggleDept = (key: string) =>
    setExpandedDepts((p) => ({ ...p, [key]: !p[key] }))
  const toggleDistrict = (key: string) =>
    setExpandedDistricts((p) => ({ ...p, [key]: !p[key] }))

  const stats = data?.stats

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
            Pagos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administración de pagos mensuales por negocio · Solo administradores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Año</Label>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {[
          { label: "Negocios", value: stats?.total_businesses ?? "—" },
          { label: "Pagos este mes", value: stats?.paid_this_month ?? "—" },
          { label: "Pendientes", value: stats?.pending ?? "—" },
          { label: "Vencidos", value: stats?.overdue ?? "—" },
          { label: "Ingreso esperado", value: stats ? formatGs(stats.expected_income) : "—" },
          { label: "Ingreso recibido", value: stats ? formatGs(stats.received_income) : "—" },
          { label: "Faltante", value: stats ? formatGs(stats.missing_income) : "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2 text-lg font-bold tabular-nums text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative xl:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre…"
              className="pl-9"
            />
          </div>
          <Select
            value={deptFilter}
            onValueChange={(v) => {
              setDeptFilter(v)
              setDistrictFilter("all")
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los departamentos</SelectItem>
              {getDepartmentsGrouped().flatMap((g) =>
                g.items.map((d) => (
                  <SelectItem key={d.key} value={d.key}>
                    {d.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Select
            value={districtFilter}
            onValueChange={setDistrictFilter}
            disabled={deptFilter === "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Distrito" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los distritos</SelectItem>
              {districtOptions.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
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
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
              <SelectItem value="no_corresponde">No corresponde</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendientes">Pendientes primero</SelectItem>
              <SelectItem value="vencidos">Vencidos primero</SelectItem>
              <SelectItem value="pagados">Pagados primero</SelectItem>
              <SelectItem value="nombre">Nombre</SelectItem>
              <SelectItem value="monto">Monto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <span
              key={key}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium",
                meta.className
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
              {meta.label}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          {error}
        </p>
      ) : tree.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          No hay negocios con esos filtros.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {tree.map((dept) => {
            const deptOpen = expandedDepts[dept.key] !== false
            const deptCount = dept.districts.reduce((n, d) => n + d.businesses.length, 0)
            return (
              <div
                key={dept.key}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleDept(dept.key)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/40"
                >
                  {deptOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-base font-semibold text-foreground">{dept.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {deptCount} {deptCount === 1 ? "negocio" : "negocios"}
                  </span>
                </button>

                {deptOpen ? (
                  <div className="border-t border-border px-2 pb-3 pt-1 sm:px-3">
                    {dept.districts.map((district) => {
                      const dKey = `${dept.key}::${district.name}`
                      const dOpen = expandedDistricts[dKey] !== false
                      return (
                        <div key={dKey} className="mt-2">
                          <button
                            type="button"
                            onClick={() => toggleDistrict(dKey)}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-muted/50"
                          >
                            {dOpen ? (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span className="text-sm font-medium text-foreground">
                              {district.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({district.businesses.length})
                            </span>
                          </button>

                          {dOpen ? (
                            <div className="mt-2 flex flex-col gap-3 pl-2 sm:pl-6">
                              {district.businesses.map((biz) => {
                                const deptName =
                                  getDepartmentName(
                                    findDepartmentKeyForDistrict(biz.city) || ""
                                  ) || "—"
                                const focus = biz.months.find((m) => m.month === focusMonth)
                                return (
                                  <article
                                    key={biz.id}
                                    className="rounded-2xl border border-border/80 bg-background p-4 shadow-sm"
                                  >
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <h3 className="text-base font-semibold text-foreground">
                                            {biz.name}
                                          </h3>
                                          {biz.featured ? (
                                            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                                              Destacado
                                            </span>
                                          ) : null}
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                          {biz.category || "Sin categoría"} · {deptName} ·{" "}
                                          {biz.city}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                          <span>
                                            Plan:{" "}
                                            <strong className="text-foreground">{biz.plan}</strong>
                                          </span>
                                          <span>
                                            Monto:{" "}
                                            <strong className="text-foreground">
                                              {formatGs(biz.monthly_amount)}
                                            </strong>
                                          </span>
                                          <span>
                                            Alta:{" "}
                                            <strong className="text-foreground">
                                              {formatDate(biz.created_at)}
                                            </strong>
                                          </span>
                                          {focus ? (
                                            <span
                                              className={cn(
                                                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium",
                                                STATUS_META[focus.status].className
                                              )}
                                            >
                                              <span
                                                className={cn(
                                                  "h-1.5 w-1.5 rounded-full",
                                                  STATUS_META[focus.status].dot
                                                )}
                                              />
                                              {STATUS_META[focus.status].label} (
                                              {MONTH_LABELS[focusMonth - 1]})
                                            </span>
                                          ) : null}
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="gap-1.5"
                                          onClick={() => quickMarkPaid(biz)}
                                        >
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                          Marcar pagado
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="gap-1.5"
                                          onClick={() => openAmount(biz)}
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                          Editar monto
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-1.5" asChild>
                                          <Link href={`/negocio/${biz.slug}/editar`}>
                                            <Building2 className="h-3.5 w-3.5" />
                                            Editar
                                          </Link>
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-1.5" asChild>
                                          <Link href={`/negocio/${biz.slug}`} target="_blank">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Perfil
                                          </Link>
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="gap-1.5"
                                          onClick={() => openHistory(biz)}
                                        >
                                          <History className="h-3.5 w-3.5" />
                                          Historial
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-12">
                                      {biz.months.map((cell) => {
                                        const meta = STATUS_META[cell.status]
                                        return (
                                          <button
                                            key={cell.month}
                                            type="button"
                                            onClick={() => openMonth(biz, cell)}
                                            title={`${MONTH_FULL[cell.month - 1]} · ${meta.label}`}
                                            className={cn(
                                              "flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center transition hover:scale-[1.02] hover:shadow-sm",
                                              meta.className
                                            )}
                                          >
                                            <span className="text-[10px] font-semibold uppercase">
                                              {MONTH_LABELS[cell.month - 1]}
                                            </span>
                                            <span
                                              className={cn("h-2 w-2 rounded-full", meta.dot)}
                                            />
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </article>
                                )
                              })}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal mes */}
      <Dialog open={!!monthModal} onOpenChange={(o) => !o && setMonthModal(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {monthModal
                ? `${monthModal.business.name} · ${MONTH_FULL[monthModal.cell.month - 1]} ${year}`
                : "Pago del mes"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <Label>Monto (Gs)</Label>
              <Input
                type="number"
                min={0}
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Select
                value={formStatus}
                onValueChange={(v) => setFormStatus(v as PaymentMonthStatus)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="no_corresponde">No corresponde</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha de pago</Label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Método de pago</Label>
              <Select value={formMethod} onValueChange={setFormMethod}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observaciones</Label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                placeholder="Pagó adelantado, bonificado, pendiente de confirmación…"
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMonthModal(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={saveMonth} disabled={saving} className="gap-1.5">
              <Wallet className="h-4 w-4" />
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal monto */}
      <Dialog open={!!amountModal} onOpenChange={(o) => !o && setAmountModal(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar monto · {amountModal?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <Label>Monto mensual (Gs)</Label>
              <Input
                type="number"
                min={0}
                value={formMonthly}
                onChange={(e) => setFormMonthly(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Plan</Label>
              <Input
                value={formPlan}
                onChange={(e) => setFormPlan(e.target.value)}
                placeholder="Estándar, Premium…"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAmountModal(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={saveAmount} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Historial */}
      <Dialog open={!!historyModal} onOpenChange={(o) => !o && setHistoryModal(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Historial · {historyModal?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto py-2">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin cambios registrados.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {history.map((h) => (
                  <li
                    key={h.id}
                    className="rounded-xl border border-border bg-muted/30 px-3 py-2.5"
                  >
                    <p className="text-xs text-muted-foreground">
                      {formatDate(h.created_at)}
                      {h.admin_name ? ` · ${h.admin_name}` : ""}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{h.action}</p>
                    {h.details ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{h.details}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
