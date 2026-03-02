"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"

const ASUNCION = { lat: -25.2633, lng: -57.5759 }

type Props = {
  latitude: number | null
  longitude: number | null
  onLocationChange: (lat: number, lng: number) => void
}

export function MapPinPicker({ latitude, longitude, onLocationChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<{ remove: () => void } | null>(null)
  const markerRef = useRef<{ setLatLng: (latlng: [number, number]) => void; remove: () => void } | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return
    let cancelled = false
    import("leaflet").then((mod) => {
      if (cancelled || !containerRef.current) return
      const L = mod.default
      // Fix: el ícono del pin no se ve en Next.js porque Leaflet usa rutas relativas
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })
      const center = latitude != null && longitude != null
        ? { lat: latitude, lng: longitude }
        : ASUNCION

      const map = L.map(containerRef.current).setView([center.lat, center.lng], 13)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map)

      let marker: ReturnType<typeof L.marker> | null = null
      if (latitude != null && longitude != null) {
        marker = L.marker([latitude, longitude]).addTo(map)
      }

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng
        onLocationChange(lat, lng)
      })

      mapRef.current = map
      markerRef.current = marker
    })
    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const marker = markerRef.current
    if (!map) return
    if (latitude != null && longitude != null) {
      if (marker) marker.setLatLng([latitude, longitude])
      else {
        import("leaflet").then((mod) => {
          const m = mod.default.marker([latitude, longitude]).addTo(map)
          markerRef.current = m
        })
      }
    } else if (marker) {
      marker.remove()
      markerRef.current = null
    }
  }, [latitude, longitude])

  return (
    <div
      ref={containerRef}
      className="h-64 w-full rounded-xl border border-border bg-muted"
      style={{ minHeight: 256 }}
    />
  )
}
