"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { fetchSubcategories, createBusiness, updateBusiness } from "@/lib/api"
import type { BusinessDetailApi } from "@/lib/api"
import { Upload, X, Loader2, CheckCircle2, Clock, MapPin, Phone } from "lucide-react"

const MapPinPicker = dynamic(
  () => import("@/components/map-pin-picker").then((m) => ({ default: m.MapPinPicker })),
  { ssr: false }
)

// Horarios preestablecidos: días y franjas de 30 min
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const
const TIME_OPTIONS: string[] = (() => {
  const opts: string[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of ["00", "30"]) {
      opts.push(`${String(h).padStart(2, "0")}:${m}`)
    }
  }
  return opts
})()

type DaySchedule = { closed: boolean; from: string; to: string }

const defaultDaySchedule = (): DaySchedule => ({
  closed: true,
  from: "09:00",
  to: "18:00",
})

function scheduleToOpeningHours(schedule: DaySchedule[]): string {
  return schedule
    .map((s, i) => {
      const day = DAYS[i]
      if (s.closed) return `${day}: Cerrado`
      return `${day}: ${s.from}-${s.to}`
    })
    .join("\n")
}

/** Parsea texto "Lunes: 09:00-18:00" / "Martes: Cerrado" al array de horarios por día */
function openingHoursToSchedule(text: string | null | undefined): DaySchedule[] {
  const result = Array.from({ length: 7 }, defaultDaySchedule)
  if (!text?.trim()) return result
  const lines = text.trim().split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^\s*(\w+)\s*:\s*(.+)$/i)
    if (!match) continue
    const dayName = match[1].trim()
    const value = match[2].trim()
    const dayIndex = DAYS.findIndex((d) => d.toLowerCase() === dayName.toLowerCase())
    if (dayIndex === -1) continue
    if (/cerrado/i.test(value)) {
      result[dayIndex] = { closed: true, from: "09:00", to: "18:00" }
    } else {
      const timeMatch = value.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/)
      if (timeMatch) {
        result[dayIndex] = {
          closed: false,
          from: timeMatch[1].length === 4 ? `0${timeMatch[1]}` : timeMatch[1],
          to: timeMatch[2].length === 4 ? `0${timeMatch[2]}` : timeMatch[2],
        }
      }
    }
  }
  return result
}

// Listas estáticas (mismo orden que schema.sql) para que siempre aparezcan opciones
const STATIC_CITIES = [
  "Asuncion", "Ciudad del Este", "Encarnacion", "Luque", "San Lorenzo",
  "Lambare", "Fernando de la Mora", "Capiata", "Mariano Roque Alonso",
]
const STATIC_CATEGORIES: { slug: string; title: string }[] = [
  { slug: "gastronomia", title: "Gastronomía" },
  { slug: "belleza-y-spa", title: "Belleza y Spa" },
  { slug: "fitness", title: "Fitness" },
  { slug: "cafeterias", title: "Cafeterías" },
  { slug: "salud", title: "Salud" },
  { slug: "automotriz", title: "Automotriz" },
  { slug: "moda", title: "Moda" },
  { slug: "hoteleria", title: "Hoteleria" },
  { slug: "educacion", title: "Educación" },
  { slug: "transporte", title: "Transporte" },
  { slug: "servicios", title: "Servicios" },
  { slug: "bienestar", title: "Bienestar" },
  { slug: "mascotas", title: "Mascotas" },
  { slug: "legal", title: "Legal" },
  { slug: "inmobiliarias", title: "Inmobiliarias" },
  { slug: "farmacias", title: "Farmacias" },
  { slug: "supermercados", title: "Supermercados" },
  { slug: "fotografia", title: "Fotografía" },
  { slug: "eventos", title: "Eventos" },
  { slug: "tecnologia", title: "Tecnología" },
]
// Slugs deben coincidir EXACTAMENTE con la base de datos para que el filtro por subcategoría funcione
const STATIC_SUBCATEGORIES: Record<string, { slug: string; title: string }[]> = {
  gastronomia: [
    { slug: "pizzeria", title: "Pizzería" },
    { slug: "hamburgueseria", title: "Hamburguesería" },
    { slug: "parrilla", title: "Parrilla" },
    { slug: "sushi", title: "Sushi" },
    { slug: "comida-rapida", title: "Comida rápida" },
    { slug: "comida-internacional", title: "Comida internacional" },
    { slug: "postres-reposteria", title: "Postres y repostería" },
  ],
  "belleza-y-spa": [
    { slug: "peluquerias", title: "Peluquerías" },
    { slug: "barberias", title: "Barberías" },
    { slug: "spa", title: "Spa" },
    { slug: "unas", title: "Uñas" },
    { slug: "estetica", title: "Estética" },
  ],
  fitness: [
    { slug: "gimnasios", title: "Gimnasios" },
    { slug: "yoga", title: "Yoga" },
    { slug: "pilates", title: "Pilates" },
    { slug: "crossfit", title: "CrossFit" },
    { slug: "nutricion-deportiva", title: "Nutrición deportiva" },
  ],
  cafeterias: [
    { slug: "cafe-especialidad", title: "Café de especialidad" },
    { slug: "panaderias", title: "Panaderías" },
    { slug: "confiterias", title: "Confiterías" },
  ],
  salud: [
    { slug: "clinica", title: "Clínica" },
    { slug: "farmacia", title: "Farmacia" },
    { slug: "gimnasio", title: "Gimnasio" },
    { slug: "odontologia", title: "Odontología" },
    { slug: "pediatria", title: "Pediatría" },
    { slug: "laboratorios", title: "Laboratorios" },
  ],
  automotriz: [
    { slug: "talleres-mecanicos", title: "Talleres mecánicos" },
    { slug: "lubricentros", title: "Lubricentros" },
    { slug: "cerrajeria-automotriz", title: "Cerrajería automotriz" },
    { slug: "concesionarias", title: "Concesionarias" },
  ],
  moda: [
    { slug: "ropa-mujer", title: "Ropa mujer" },
    { slug: "ropa-hombre", title: "Ropa hombre" },
    { slug: "calzado", title: "Calzado" },
    { slug: "accesorios", title: "Accesorios" },
    { slug: "boutiques", title: "Boutiques" },
  ],
  hoteleria: [
    { slug: "hoteles", title: "Hoteles" },
    { slug: "hostels", title: "Hostels" },
    { slug: "apart-hoteles", title: "Apart hoteles" },
    { slug: "posadas", title: "Posadas" },
  ],
  educacion: [
    { slug: "idiomas", title: "Idiomas" },
    { slug: "musica", title: "Música" },
    { slug: "informatica", title: "Informática" },
    { slug: "cursos-talleres", title: "Cursos y talleres" },
  ],
  transporte: [
    { slug: "taxis", title: "Taxis" },
    { slug: "remises", title: "Remises" },
    { slug: "envios", title: "Envíos" },
    { slug: "alquiler-autos", title: "Alquiler de autos" },
  ],
  servicios: [
    { slug: "plomeria", title: "Plomería" },
    { slug: "electricidad", title: "Electricidad" },
    { slug: "limpieza", title: "Limpieza" },
    { slug: "mudanzas", title: "Mudanzas" },
  ],
  bienestar: [
    { slug: "psicologia", title: "Psicología" },
    { slug: "masajes", title: "Masajes" },
    { slug: "meditacion", title: "Meditación" },
    { slug: "nutricion", title: "Nutrición" },
  ],
  mascotas: [
    { slug: "veterinarias", title: "Veterinarias" },
    { slug: "tiendas-mascotas", title: "Tiendas para mascotas" },
    { slug: "peluqueria-canina", title: "Peluquería canina" },
  ],
  legal: [
    { slug: "civil", title: "Derecho civil" },
    { slug: "laboral", title: "Derecho laboral" },
    { slug: "inmobiliario", title: "Derecho inmobiliario" },
  ],
  inmobiliarias: [
    { slug: "ventas", title: "Ventas" },
    { slug: "alquileres", title: "Alquileres" },
    { slug: "administracion", title: "Administración" },
  ],
  farmacias: [
    { slug: "farmacias", title: "Farmacias" },
    { slug: "droguerias", title: "Droguerías" },
  ],
  supermercados: [
    { slug: "supermercados", title: "Supermercados" },
    { slug: "minimercados", title: "Minimercados" },
    { slug: "almacenes", title: "Almacenes" },
  ],
  fotografia: [
    { slug: "estudios", title: "Estudios fotográficos" },
    { slug: "eventos", title: "Fotografía de eventos" },
    { slug: "impresion", title: "Impresión" },
  ],
  eventos: [
    { slug: "salones", title: "Salones de eventos" },
    { slug: "catering", title: "Catering" },
    { slug: "decoracion", title: "Decoración" },
    { slug: "musica-vivo", title: "Música en vivo" },
  ],
  tecnologia: [
    { slug: "reparacion-celulares", title: "Reparación de celulares" },
    { slug: "informatica", title: "Informática" },
    { slug: "electronica", title: "Electrónica" },
  ],
}

type Props = {
  initialCategories?: { slug: string; title: string }[]
  initialCities?: string[]
  /** Modo edición: slug del negocio y datos actuales (misma interfaz que crear) */
  editSlug?: string
  initialData?: BusinessDetailApi | null
}

export function RegisterBusinessForm({ initialCategories = [], initialCities = [], editSlug, initialData }: Props) {
  const isEdit = Boolean(editSlug && initialData)
  const router = useRouter()
  const { user, token } = useAuth()
  const categories = initialCategories?.length ? initialCategories : STATIC_CATEGORIES
  const cities = initialCities?.length ? initialCities : STATIC_CITIES
  const [subcategories, setSubcategories] = useState<{ slug: string; title: string }[]>([])
  const [categorySlug, setCategorySlug] = useState<string>("")
  const [subcategorySlug, setSubcategorySlug] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string>("")
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [schedule, setSchedule] = useState<DaySchedule[]>(() =>
    Array.from({ length: 7 }, defaultDaySchedule)
  )
  const [mapLat, setMapLat] = useState<number | null>(null)
  const [mapLng, setMapLng] = useState<number | null>(null)
  const [featured, setFeatured] = useState(false)

  // Pre-llenar estado en modo edición
  useEffect(() => {
    if (!initialData) return
    setCategorySlug(initialData.category_slug ?? "")
    setSubcategorySlug(initialData.subcategory_slug ?? "")
    setCity(initialData.city ?? "")
    setFeatured(Boolean(initialData.featured))
    setCoverUrl(initialData.image_url ?? "")
    setCoverPreview(initialData.image_url ?? null)
    setGalleryUrls(initialData.gallery_images ?? [])
    setGalleryPreviews(initialData.gallery_images ?? [])
    setSchedule(openingHoursToSchedule(initialData.opening_hours ?? undefined))
    const lat = initialData.latitude != null ? Number(initialData.latitude) : null
    const lng = initialData.longitude != null ? Number(initialData.longitude) : null
    setMapLat(Number.isFinite(lat) ? lat : null)
    setMapLng(Number.isFinite(lng) ? lng : null)
  }, [initialData])

  useEffect(() => {
    if (!categorySlug) {
      setSubcategories([])
      if (!initialData) setSubcategorySlug("")
      return
    }
    const staticSubs = STATIC_SUBCATEGORIES[categorySlug]
    if (staticSubs?.length) {
      setSubcategories(staticSubs)
      if (!initialData) setSubcategorySlug("")
      return
    }
    fetchSubcategories(categorySlug).then((data) => {
      const list = Array.isArray(data) ? data.map((s) => ({ slug: s.slug, title: s.title }))
        : []
      setSubcategories(list.length > 0 ? list : [])
      if (!initialData) setSubcategorySlug("")
    })
  }, [categorySlug, initialData])

  // Banner: resolución recomendada 1920×768 px. Se guarda en alta calidad (JPEG 92%).
  const BANNER_MAX_W = 1920
  const BANNER_MAX_H = 768
  const BANNER_JPEG_QUALITY = 0.92

  const resizeImageToBlob = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        let w = img.width
        let h = img.height
        if (w > BANNER_MAX_W || h > BANNER_MAX_H) {
          if (w > h) {
            h = Math.round((h * BANNER_MAX_W) / w)
            w = BANNER_MAX_W
          } else {
            w = Math.round((w * BANNER_MAX_H) / h)
            h = BANNER_MAX_H
          }
        }
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(file)
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : resolve(file)),
          "image/jpeg",
          BANNER_JPEG_QUALITY
        )
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(file)
      }
      img.src = url
    })
  }

  const uploadImage = useCallback(
    async (file: File): Promise<{ url?: string; error?: string }> => {
      if (!token) {
        return { error: "Iniciá sesión como administrador para subir fotos." }
      }
      try {
        const blob = await resizeImageToBlob(file)
        const form = new FormData()
        form.append("image", blob, file.name || "image.jpg")
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok && data?.url) return { url: data.url }
        const errMsg = data?.error || "No se pudo subir la imagen."
        const detail = data?.detail ? ` (${data.detail})` : ""
        return { error: errMsg + detail }
      } catch (e) {
        console.error("Upload error:", e)
        return { error: "Error de conexión. ¿Está corriendo el frontend y el backend?" }
      }
    },
    [token]
  )

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith("image/")) return
    setUploading(true)
    setError(null)
    const result = await uploadImage(file)
    setUploading(false)
    if (result.url) {
      setCoverUrl(result.url)
      setCoverPreview(URL.createObjectURL(file))
    } else {
      setError(result.error || "No se pudo subir la foto de portada.")
    }
  }

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setError(null)
    const newUrls: string[] = []
    const newPreviews: string[] = []
    let errMsg: string | null = null
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue
      const result = await uploadImage(file)
      if (result.url) {
        newUrls.push(result.url)
        newPreviews.push(URL.createObjectURL(file))
      } else if (result.error) {
        errMsg = result.error
      }
    }
    if (errMsg) setError(errMsg)
    setGalleryUrls((prev) => [...prev, ...newUrls])
    setGalleryPreviews((prev) => [...prev, ...newPreviews])
    setUploading(false)
  }

  const removeGallery = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index))
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token || user?.role !== "admin") {
      setError("Solo administradores pueden registrar empresas.")
      return
    }
    const form = e.currentTarget
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value?.trim()
    const cityVal = city
    if (!name || !categorySlug || !cityVal) {
      setError("Nombre, categoría y ciudad son obligatorios.")
      return
    }
    setSubmitting(true)
    setError(null)
    const openingHoursStr = scheduleToOpeningHours(schedule)
    const payload = {
      name,
      category_slug: categorySlug,
      subcategory_slug: subcategorySlug || undefined,
      city: cityVal,
      location: (form.querySelector('[name="location"]') as HTMLInputElement)?.value?.trim() || undefined,
      latitude: mapLat,
      longitude: mapLng,
      description: (form.querySelector('[name="description"]') as HTMLTextAreaElement)?.value?.trim() || undefined,
      phone: (form.querySelector('[name="phone"]') as HTMLInputElement)?.value?.trim() || undefined,
      instagram_url: (form.querySelector('[name="instagram_url"]') as HTMLInputElement)?.value?.trim() || undefined,
      opening_hours: openingHoursStr || "",
      menu_services: (form.querySelector('[name="menu_services"]') as HTMLTextAreaElement)?.value?.trim() || undefined,
      image_url: coverUrl || undefined,
      gallery_images: galleryUrls.length ? galleryUrls : undefined,
      featured,
    }
    if (isEdit && editSlug) {
      const { error: err } = await updateBusiness(editSlug, payload, token)
      setSubmitting(false)
      if (err) {
        setError(err)
        return
      }
      setSuccess(true)
      setTimeout(() => router.push(`/negocio/${editSlug}`), 1500)
      return
    }
    const result = await createBusiness(payload, token)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setSuccess(true)
    setTimeout(() => router.push("/negocios"), 2000)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          {isEdit ? "Cambios guardados" : "Empresa registrada"}
        </h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          {isEdit
            ? "Los cambios se guardaron correctamente. Serás redirigido al local."
            : "La empresa fue registrada correctamente. Serás redirigido al listado de negocios."}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {error && (
        <div className="mx-auto w-full max-w-6xl px-4 pb-4 md:px-8">
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        </div>
      )}

      {/* Hero: mismo formato que la vista del negocio */}
      <section className="relative h-72 w-full overflow-hidden md:h-80 lg:h-96">
        {coverPreview ? (
          <img
            src={coverPreview}
            alt="Portada"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">Foto de portada</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 md:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    required
                    className="w-[180px] rounded-lg border border-primary-foreground/40 bg-card/20 px-3 py-2 text-sm text-primary-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
                  >
                    <option value="">Categoría *</option>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  name="name"
                  placeholder="Nombre de la empresa *"
                  required
                  defaultValue={initialData?.name ?? ""}
                  className="max-w-md border-0 border-b-2 border-primary-foreground/50 bg-transparent text-2xl font-bold text-primary-foreground placeholder:text-primary-foreground/70 md:text-3xl lg:text-4xl"
                />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-[200px] rounded-lg border-0 bg-transparent px-2 py-1 text-sm text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
                >
                  <option value="">Ciudad *</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <label className="cursor-pointer rounded-lg bg-card/20 px-3 py-2 backdrop-blur-sm text-sm text-primary-foreground hover:bg-card/30">
                <Upload className="mr-1.5 inline h-4 w-4" />
                {uploading ? "Subiendo..." : coverPreview ? "Cambiar portada" : "Subir foto de portada"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido: mismo layout que la vista del negocio (2 cols + sidebar) */}
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 lg:py-12">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="flex flex-col gap-10 lg:col-span-2">
            {/* Acerca de */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-foreground">Acerca de</h2>
              <Textarea
                name="description"
                placeholder="Contanos sobre tu negocio, qué ofrecés y qué te destaca."
                defaultValue={initialData?.description ?? ""}
                className="min-h-24 resize-none rounded-xl border-border bg-card"
              />
            </div>

            {/* Horario de atención */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-foreground">Horario de atención</h2>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2.5 pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-sm text-muted-foreground">Elegí el horario de cada día o marcá Cerrado</span>
                </div>
                <div className="flex flex-col gap-2">
                  {DAYS.map((day, i) => (
                    <div key={day} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-background/50 p-2 sm:gap-3">
                      <span className="w-24 shrink-0 text-sm font-medium text-foreground">{day}</span>
                      <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={schedule[i].closed}
                          onChange={(e) => {
                            setSchedule((prev) => {
                              const next = [...prev]
                              next[i] = { ...next[i], closed: e.target.checked }
                              return next
                            })
                          }}
                          className="h-4 w-4 rounded border-border"
                        />
                        Cerrado
                      </label>
                      {!schedule[i].closed && (
                        <>
                          <span className="text-xs text-muted-foreground">desde</span>
                          <select
                            value={schedule[i].from}
                            onChange={(e) => {
                              setSchedule((prev) => {
                                const next = [...prev]
                                next[i] = { ...next[i], from: e.target.value }
                                return next
                              })
                            }}
                            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <span className="text-xs text-muted-foreground">hasta</span>
                          <select
                            value={schedule[i].to}
                            onChange={(e) => {
                              setSchedule((prev) => {
                                const next = [...prev]
                                next[i] = { ...next[i], to: e.target.value }
                                return next
                              })
                            }}
                            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-foreground">Contacto</h2>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  name="phone"
                  placeholder="+595 9xx xxx xxx (teléfono / WhatsApp)"
                  defaultValue={initialData?.phone ?? ""}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-base text-muted-foreground">@</span>
                <Input
                  name="instagram_url"
                  placeholder="Instagram (usuario o enlace completo)"
                  defaultValue={initialData?.instagram_url ?? ""}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-foreground">Ubicación</h2>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <Input
                  name="location"
                  placeholder="Dirección o referencia (ej: Av. España 123)"
                  defaultValue={initialData?.location ?? ""}
                  className="flex-1 rounded-xl border-border bg-card"
                />
              </div>
              <p className="text-sm text-muted-foreground">Hacé clic en el mapa para marcar la ubicación del local</p>
              <MapPinPicker
                latitude={mapLat}
                longitude={mapLng}
                onLocationChange={(lat, lng) => {
                  setMapLat(lat)
                  setMapLng(lng)
                }}
              />
            </div>

            {/* Fotos del local */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-foreground">Fotos del local</h2>
              <div className="flex flex-wrap gap-2.5">
                {galleryPreviews.map((src, i) => (
                  <div key={i} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    <img src={src} alt="" className="block h-20 w-20 object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); removeGallery(i); }}
                      title="Eliminar foto"
                      className="absolute right-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-bl-lg bg-red-500 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 text-muted-foreground hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  <span className="text-xs">Agregar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryChange}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Más información */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-foreground">Más información</h2>
              <div className="rounded-xl border border-border bg-card p-4">
                <Textarea
                  name="menu_services"
                  placeholder="Listá los platos, servicios o productos que ofrecés (cada uno en una línea o con el formato que quieras)."
                  defaultValue={initialData?.menu_services ?? ""}
                  className="min-h-28 resize-none border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Sidebar: categoría, subcategoría, enviar */}
          <aside className="lg:sticky lg:top-20">
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground">Datos principales</h3>
              <div className="flex flex-col gap-2.5">
                <Label className="text-muted-foreground">Subcategoría (opcional)</Label>
                <select
                  value={subcategorySlug}
                  onChange={(e) => setSubcategorySlug(e.target.value)}
                  disabled={!categorySlug}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">Seleccionar subcategoría</option>
                  {subcategories.map((sub) => (
                    <option key={sub.slug} value={sub.slug}>
                      {sub.title}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-background/50 px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="font-medium text-foreground">Destacado</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Los negocios destacados aparecen en la página de inicio y primero en listados.
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="mt-2 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEdit ? "Guardando…" : "Registrando…"}
                  </>
                ) : (
                  isEdit ? "Guardar cambios" : "Registrar empresa"
                )}
              </Button>
            </div>
          </aside>
        </div>
      </main>
    </form>
  )
}
