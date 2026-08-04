"use client"

import { useEffect, useState } from "react"
import { getOpenStatus, type OpenStatus } from "@/lib/opening-hours"
import { cn } from "@/lib/utils"

type Props = {
  openingHours?: string | null
  /** Estado opcional ya calculado en el servidor */
  isOpen?: boolean | null
  openLabel?: string | null
  openDetail?: string | null
  className?: string
  compact?: boolean
}

export function OpenStatusBadge({
  openingHours,
  isOpen,
  openLabel,
  openDetail,
  className,
  compact = false,
}: Props) {
  const [status, setStatus] = useState<OpenStatus>(() => {
    if (openLabel) {
      return {
        isOpen: Boolean(isOpen),
        hasSchedule: openLabel !== "Horario no disponible",
        label: openLabel,
        detail: openDetail ?? null,
        sortRank: isOpen ? 0 : openLabel === "Horario no disponible" ? 2 : 1,
      }
    }
    return getOpenStatus(openingHours)
  })

  useEffect(() => {
    const refresh = () => setStatus(getOpenStatus(openingHours))
    refresh()
    const id = window.setInterval(refresh, 60_000)
    return () => window.clearInterval(id)
  }, [openingHours])

  if (!status.hasSchedule && !status.label) return null

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
          status.isOpen
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            : status.hasSchedule
              ? "bg-red-500/15 text-red-700 dark:text-red-400"
              : "bg-muted text-muted-foreground"
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            status.isOpen ? "bg-emerald-500" : status.hasSchedule ? "bg-red-500" : "bg-muted-foreground"
          )}
          aria-hidden
        />
        {status.isOpen ? "Abierto ahora" : status.hasSchedule ? "Cerrado" : status.label}
      </span>
      {!compact && status.detail ? (
        <span className="text-[11px] leading-tight text-muted-foreground">{status.detail}</span>
      ) : null}
    </div>
  )
}
