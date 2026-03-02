"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BusinessCard } from "@/components/business-card"
import { CoverHero } from "@/components/business/cover-hero"
import { BusinessInfo } from "@/components/business/business-info"
import { PhotoGallery } from "@/components/business/photo-gallery"
import { MenuSection } from "@/components/business/menu-section"
import { QuickActions } from "@/components/business/quick-actions"
import { useAuth } from "@/contexts/auth-context"
import { deleteBusiness, checkIsFavorite, addFavorite, removeFavorite } from "@/lib/api"
import type { BusinessDetailApi, BusinessApi } from "@/lib/api"
import { Pencil, Trash2, Heart } from "lucide-react"

async function fetchBusinessFromClient(slug: string): Promise<BusinessDetailApi | null> {
  try {
    const res = await fetch(`/api/businesses/${encodeURIComponent(slug)}`, { cache: "no-store" })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function fetchRelatedFromClient(categorySlug?: string): Promise<BusinessApi[]> {
  if (!categorySlug) return []
  try {
    const res = await fetch(`/api/businesses?category=${encodeURIComponent(categorySlug)}`, { cache: "no-store" })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export function NegocioDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const slug = typeof params?.slug === "string" ? params.slug : ""
  const [business, setBusiness] = useState<BusinessDetailApi | null>(null)
  const [related, setRelated] = useState<BusinessApi[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const isAdmin = user?.role === "admin"
  const isClient = user?.role === "user"

  const handleDelete = async () => {
    if (!slug || !token) return
    setDeleting(true)
    const { error } = await deleteBusiness(slug, token)
    setDeleting(false)
    setConfirmDelete(false)
    if (error) {
      alert(error)
      return
    }
    router.push("/negocios")
  }

  useEffect(() => {
    if (!slug) {
      setNotFound(true)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    fetchBusinessFromClient(slug).then((data) => {
      if (cancelled) return
      setBusiness(data)
      if (!data) setNotFound(true)
      setLoading(false)
      if (data?.category_slug) {
        fetchRelatedFromClient(data.category_slug).then((list) => {
          if (!cancelled) setRelated(list.filter((b) => b.slug !== slug).slice(0, 3))
        })
      }
    })
    return () => { cancelled = true }
  }, [slug])

  useEffect(() => {
    if (!slug || !token || !isClient) return
    let cancelled = false
    checkIsFavorite(slug, token).then((fav) => {
      if (!cancelled) setIsFavorite(fav)
    })
    return () => { cancelled = true }
  }, [slug, token, isClient])

  const handleToggleFavorite = async () => {
    if (!token || !slug) return
    setFavoriteLoading(true)
    if (isFavorite) {
      const { error } = await removeFavorite(slug, token)
      if (!error) setIsFavorite(false)
      else alert(error)
    } else {
      const { error } = await addFavorite(slug, token)
      if (!error) setIsFavorite(true)
      else alert(error)
    }
    setFavoriteLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm">Cargando negocio…</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
          <h1 className="text-2xl font-bold text-foreground">Negocio no encontrado</h1>
          <p className="mt-2 text-muted-foreground text-center max-w-sm">
            No existe un negocio con esa dirección o puede haber sido eliminado.
          </p>
          <Button asChild className="mt-6">
            <Link href="/negocios">Volver a negocios</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-3 md:px-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Inicio</Link>
            <span>/</span>
            <Link
              href={business.category_slug ? `/categorias/${business.category_slug}` : "/categorias"}
              className="hover:text-foreground"
            >
              {business.category ?? "Categoria"}
            </Link>
            <span>/</span>
            <span className="truncate font-medium text-foreground">{business.name}</span>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <Link href={`/negocio/${slug}/editar`}>
                  <Pencil className="h-3.5 w-3.5" />
                  Editar local
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="bg-card rounded-xl shadow-xl max-w-sm w-full p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">¿Eliminar este local?</h3>
            <p className="text-sm text-muted-foreground">
              Se borrará &quot;{business.name}&quot;. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Eliminando…" : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <CoverHero business={business} />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 lg:py-12">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="flex flex-col gap-10 lg:col-span-2">
            <BusinessInfo business={business} />
            <PhotoGallery business={business} />
            <MenuSection business={business} />
          </div>
          <aside className="lg:sticky lg:top-20 space-y-4">
            {isClient && (
              <Button
                variant={isFavorite ? "secondary" : "outline"}
                className="w-full gap-2"
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                {favoriteLoading ? "…" : isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              </Button>
            )}
            <QuickActions business={business} />
          </aside>
        </div>
      </main>

      {related.length > 0 ? (
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Negocios similares</h2>
              <Button asChild variant="outline" size="sm">
                <Link href={business.category_slug ? `/categorias/${business.category_slug}` : "/negocios"}>
                  Ver mas
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
          <Link href="/negocios">
            Volver a todos los negocios
          </Link>
        </Button>
      </div>

      <Footer />
    </div>
  )
}
