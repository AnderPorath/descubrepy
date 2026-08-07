"use client"

import dynamic from "next/dynamic"
import { Clock, MapPin, Phone } from "lucide-react"
import type { BusinessDetailApi } from "@/lib/api"
import { OpenStatusBadge } from "@/components/open-status-badge"
import { getWeekScheduleRows } from "@/lib/opening-hours"
import { trackBusinessEvent } from "@/lib/track-event"

const BusinessLocationMap = dynamic(
  () => import("@/components/business/business-location-map").then((m) => ({ default: m.BusinessLocationMap })),
  { ssr: false }
)

export function BusinessInfo({ business }: { business: BusinessDetailApi }) {
  const hasHours = Boolean(business.opening_hours?.trim())
  const scheduleRows = hasHours ? getWeekScheduleRows(business.opening_hours) : []
  const hasParsedRows = scheduleRows.length > 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">Acerca de</h2>
        {business.description?.trim() ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {business.description}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">Este negocio aún no ha cargado una descripción.</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">Horario de atención</h2>
        {hasHours ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Estado actual</p>
                  <p className="text-xs text-muted-foreground">Actualizado según horario del local</p>
                </div>
              </div>
              <OpenStatusBadge
                openingHours={business.opening_hours}
                isOpen={business.is_open}
                openLabel={business.open_label}
                openDetail={business.open_detail}
              />
            </div>
            {hasParsedRows ? (
              <ul className="divide-y divide-border">
                {scheduleRows.map((row) => (
                  <li
                    key={row.day}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <span className="text-sm font-medium text-foreground">{row.day}</span>
                    <span
                      className={
                        row.closed
                          ? "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                          : "text-right text-sm text-muted-foreground tabular-nums"
                      }
                    >
                      {row.hours}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-4">
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {business.opening_hours}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card px-4 py-4">
            <p className="text-sm italic text-muted-foreground">Horario no especificado.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">Contacto</h2>
        {business.phone?.trim() ? (
          <>
          <a
            href={`tel:${business.phone.replace(/\s/g, "")}`}
            onClick={() =>
              trackBusinessEvent({
                businessId: business.id,
                slug: business.slug,
                eventType: "phone_click",
              })
            }
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 hover:border-accent/30 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary group-hover:bg-accent/10">
              <Phone className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
            </div>
            <span className="text-sm text-foreground">{business.phone}</span>
          </a>
          <a
            href={`https://wa.me/595${business.phone.replace(/\D/g, "").slice(-9)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackBusinessEvent({
                businessId: business.id,
                slug: business.slug,
                eventType: "whatsapp_click",
              })
            }
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 hover:border-accent/30 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary group-hover:bg-accent/10">
              <Phone className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
            </div>
            <span className="text-sm text-foreground">WhatsApp</span>
          </a>
          </>
        ) : (
          <p className="text-sm italic text-muted-foreground">Teléfono no cargado.</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground">Ubicación</h2>
        {(business.location?.trim() || business.city) ? (
          <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>
              {business.location?.trim() || business.city}
              {business.location?.trim() && business.city ? `, ${business.city}` : ""}
            </span>
          </div>
        ) : (
          <p className="text-sm italic text-muted-foreground">Ubicación no especificada.</p>
        )}
        {business.latitude != null && business.longitude != null &&
         Number.isFinite(Number(business.latitude)) && Number.isFinite(Number(business.longitude)) && (
          <div className="mt-2">
            <p className="mb-2 text-sm text-muted-foreground">Ver en el mapa</p>
            <BusinessLocationMap
              latitude={Number(business.latitude)}
              longitude={Number(business.longitude)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
