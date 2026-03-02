"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"

const ASUNCION = { lat: -25.2633, lng: -57.5759 }

type Props = {
  latitude: number | null
  longitude: number | null
}

/** Mapa de solo lectura que muestra la ubicación del negocio. */
export function BusinessLocationMap({ latitude, longitude }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<{ remove: () => void } | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return
    let cancelled = false
    import("leaflet").then((mod) => {
      if (cancelled || !containerRef.current) return
      const L = mod.default
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })
      const lat = latitude != null ? Number(latitude) : ASUNCION.lat
      const lng = longitude != null ? Number(longitude) : ASUNCION.lng
      const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
      const center = hasCoords ? { lat, lng } : ASUNCION

      const map = L.map(containerRef.current).setView([center.lat, center.lng], hasCoords ? 15 : 13)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map)

      if (hasCoords) {
        L.marker([lat, lng]).addTo(map)
      }

      mapRef.current = map
    })
    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude])

  return (
    <div
      ref={containerRef}
      className="h-64 w-full overflow-hidden rounded-xl border border-border bg-muted"
      style={{ minHeight: 256 }}
    />
  )
}
