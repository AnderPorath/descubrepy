/** Zona horaria de Paraguay para estado abierto/cerrado */
export const BUSINESS_TZ = "America/Asuncion"

export const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const

export type TimeRange = { from: number; to: number }

export type DayHours = {
  dayIndex: number
  dayName: string
  closed: boolean
  ranges: TimeRange[]
  label: string
}

export type OpenStatus = {
  isOpen: boolean
  /** true si hay horario configurado usable */
  hasSchedule: boolean
  label: string
  detail: string | null
  /** 0 = abierto, 1 = cerrado (sin horario = 2 al final) */
  sortRank: number
}

function normalizeDayName(s: string): string {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
}

function padTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

/** Convierte "HH:MM" a minutos desde medianoche. */
export function timeToMinutes(t: string): number | null {
  const m = String(t ?? "").trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return null
  return h * 60 + min
}

export function formatMinutes(mins: number): string {
  const normalized = ((mins % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return padTime(h, m)
}

/**
 * Interpreta fin de rango:
 * - 00:00 como cierre = medianoche (1440)
 * - si to < from y to !== 0, asume cruza medianoche (to + 1440)
 */
function normalizeRange(fromMin: number, toMin: number): TimeRange {
  let to = toMin
  if (toMin === 0) to = 24 * 60
  else if (toMin < fromMin) to = toMin + 24 * 60
  return { from: fromMin, to }
}

export function formatRange(range: TimeRange): string {
  const toLabel = range.to >= 24 * 60 ? "00:00" : formatMinutes(range.to)
  return `${formatMinutes(range.from)} - ${toLabel}`
}

/** Obtiene fecha/hora actual en America/Asuncion */
export function getNowInBusinessTz(now: Date = new Date()): {
  dayIndex: number
  minutes: number
  dateKey: string
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  const weekday = get("weekday")
  const hourRaw = Number(get("hour"))
  // Algunos entornos devuelven "24" para medianoche
  const hour = hourRaw === 24 ? 0 : hourRaw
  const minute = Number(get("minute"))
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }
  return {
    dayIndex: map[weekday] ?? now.getDay(),
    minutes: hour * 60 + minute,
    dateKey: `${get("year")}-${get("month")}-${get("day")}`,
  }
}

const DAY_NAME_TO_INDEX: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
}

/** Parsea opening_hours a 7 días (índice JS: 0=Domingo). */
export function parseWeeklyHours(text: string | null | undefined): DayHours[] {
  const week: DayHours[] = DAY_NAMES.map((dayName, dayIndex) => ({
    dayIndex,
    dayName,
    closed: true,
    ranges: [],
    label: "Cerrado",
  }))

  if (!text?.trim()) return week

  for (const line of text.trim().split(/\r?\n/)) {
    const match = line.match(/^\s*([^:]+?)\s*:\s*(.+)$/)
    if (!match) continue
    const dayKey = normalizeDayName(match[1])
    const dayIndex = DAY_NAME_TO_INDEX[dayKey]
    if (dayIndex === undefined) continue
    const value = match[2].trim()
    if (/cerrado/i.test(value)) {
      week[dayIndex] = {
        dayIndex,
        dayName: DAY_NAMES[dayIndex],
        closed: true,
        ranges: [],
        label: "Cerrado",
      }
      continue
    }
    const ranges: TimeRange[] = []
    for (const rm of value.matchAll(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/g)) {
      const from = timeToMinutes(rm[1])
      const to = timeToMinutes(rm[2])
      if (from === null || to === null) continue
      ranges.push(normalizeRange(from, to))
    }
    ranges.sort((a, b) => a.from - b.from)
    week[dayIndex] = {
      dayIndex,
      dayName: DAY_NAMES[dayIndex],
      closed: ranges.length === 0,
      ranges,
      label: ranges.length === 0 ? "Cerrado" : ranges.map(formatRange).join(", "),
    }
  }
  return week
}

function isInRange(minutes: number, range: TimeRange): boolean {
  // Soporta rangos que cruzan medianoche (to > 1440)
  if (range.to <= 24 * 60) {
    return minutes >= range.from && minutes < range.to
  }
  // Abierto desde from hasta medianoche, o desde 0 hasta to-1440
  const toNextDay = range.to - 24 * 60
  return minutes >= range.from || minutes < toNextDay
}

function findOpenRange(minutes: number, ranges: TimeRange[]): TimeRange | null {
  return ranges.find((r) => isInRange(minutes, r)) ?? null
}

function nextOpenToday(minutes: number, ranges: TimeRange[]): number | null {
  for (const r of ranges) {
    if (minutes < r.from) return r.from
  }
  return null
}

function closesAtForRange(range: TimeRange): string {
  if (range.to >= 24 * 60) return "00:00"
  return formatMinutes(range.to)
}

/**
 * Calcula estado abierto/cerrado según horario y "ahora" en Paraguay.
 * Si se pasa `now`, usa esa Date (útil para tests o hora del servidor).
 */
export function getOpenStatus(
  openingHours: string | null | undefined,
  now: Date = new Date()
): OpenStatus {
  if (!openingHours?.trim()) {
    return {
      isOpen: false,
      hasSchedule: false,
      label: "Horario no disponible",
      detail: null,
      sortRank: 2,
    }
  }

  const week = parseWeeklyHours(openingHours)
  const hasAnyHours = week.some((d) => !d.closed && d.ranges.length > 0)
  if (!hasAnyHours) {
    return {
      isOpen: false,
      hasSchedule: true,
      label: "Cerrado",
      detail: null,
      sortRank: 1,
    }
  }

  const { dayIndex, minutes } = getNowInBusinessTz(now)
  const today = week[dayIndex]

  // ¿Abierto por un turno de hoy?
  const openRange = findOpenRange(minutes, today.ranges)
  if (openRange) {
    return {
      isOpen: true,
      hasSchedule: true,
      label: "Abierto ahora",
      detail: `Cierra a las ${closesAtForRange(openRange)}`,
      sortRank: 0,
    }
  }

  // ¿Abierto por turno de ayer que cruzó medianoche?
  const yesterday = week[(dayIndex + 6) % 7]
  for (const r of yesterday.ranges) {
    if (r.to > 24 * 60 && minutes < r.to - 24 * 60) {
      return {
        isOpen: true,
        hasSchedule: true,
        label: "Abierto ahora",
        detail: `Cierra a las ${formatMinutes(r.to - 24 * 60)}`,
        sortRank: 0,
      }
    }
  }

  // Próxima apertura hoy
  const nextToday = nextOpenToday(minutes, today.ranges)
  if (nextToday !== null) {
    return {
      isOpen: false,
      hasSchedule: true,
      label: "Cerrado",
      detail: `Abre hoy a las ${formatMinutes(nextToday)}`,
      sortRank: 1,
    }
  }

  // Buscar próximos 7 días
  for (let offset = 1; offset <= 7; offset++) {
    const idx = (dayIndex + offset) % 7
    const day = week[idx]
    if (day.closed || day.ranges.length === 0) continue
    const openAt = formatMinutes(day.ranges[0].from)
    if (offset === 1) {
      return {
        isOpen: false,
        hasSchedule: true,
        label: "Cerrado",
        detail: `Abre mañana a las ${openAt}`,
        sortRank: 1,
      }
    }
    return {
      isOpen: false,
      hasSchedule: true,
      label: "Cerrado",
      detail: `Abre el ${day.dayName.toLowerCase()} a las ${openAt}`,
      sortRank: 1,
    }
  }

  return {
    isOpen: false,
    hasSchedule: true,
    label: "Cerrado",
    detail: null,
    sortRank: 1,
  }
}

/** Horario semanal ordenado Lunes→Domingo para UI */
export function getWeekScheduleRows(openingHours: string | null | undefined): {
  day: string
  hours: string
  closed: boolean
}[] {
  const week = parseWeeklyHours(openingHours)
  const order = [1, 2, 3, 4, 5, 6, 0] // Lunes…Domingo
  return order.map((i) => ({
    day: week[i].dayName,
    hours: week[i].label,
    closed: week[i].closed,
  }))
}

/**
 * Orden: destacados abiertos → abiertos → destacados cerrados → cerrados → sin horario
 */
export function compareBusinessesByOpenStatus<
  T extends { featured?: number | boolean | null; opening_hours?: string | null },
>(a: T, b: T, now: Date = new Date()): number {
  const statusA = getOpenStatus(a.opening_hours, now)
  const statusB = getOpenStatus(b.opening_hours, now)
  const featuredA = a.featured ? 1 : 0
  const featuredB = b.featured ? 1 : 0

  const group = (featured: number, status: OpenStatus) => {
    if (status.sortRank === 0 && featured) return 0
    if (status.sortRank === 0) return 1
    if (status.sortRank === 1 && featured) return 2
    if (status.sortRank === 1) return 3
    return 4
  }

  const ga = group(featuredA, statusA)
  const gb = group(featuredB, statusB)
  if (ga !== gb) return ga - gb
  return 0
}

export function sortBusinessesByOpenStatus<
  T extends { featured?: number | boolean | null; opening_hours?: string | null },
>(list: T[], now: Date = new Date()): T[] {
  return [...list].sort((a, b) => compareBusinessesByOpenStatus(a, b, now))
}
