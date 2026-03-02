"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RegisterBusinessForm } from "@/components/register-business-form"
import { useAuth } from "@/contexts/auth-context"
import { fetchBusinessBySlug } from "@/lib/api"
import type { BusinessDetailApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function EditarNegocioPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const slug = typeof params?.slug === "string" ? params.slug : ""
  const [business, setBusiness] = useState<BusinessDetailApi | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }
    fetchBusinessBySlug(slug).then((data) => {
      setBusiness(data ?? null)
      setLoading(false)
    })
  }, [slug])

  useEffect(() => {
    if (!loading && !user) router.replace("/iniciar-sesion")
    if (!loading && user && user.role !== "admin") router.replace("/")
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="text-sm">Cargando…</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-muted-foreground">Negocio no encontrado.</p>
            <Button asChild className="mt-4">
              <Link href="/negocios">Volver a negocios</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-sm text-muted-foreground md:px-8">
          <Link href="/" className="hover:text-foreground">
            Inicio
          </Link>
          <span>/</span>
          <Link href={`/negocio/${slug}`} className="hover:text-foreground">
            {business.name}
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Editar</span>
        </div>
      </div>

      <RegisterBusinessForm editSlug={slug} initialData={business} />

      <Footer />
    </div>
  )
}
