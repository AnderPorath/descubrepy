"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BusinessCard } from "@/components/business-card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { fetchFavorites } from "@/lib/api"
import type { BusinessApi } from "@/lib/api"
import { Heart } from "lucide-react"

export default function FavoritosPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [list, setList] = useState<BusinessApi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) {
      router.replace("/iniciar-sesion")
      return
    }
    if (user.role === "admin") {
      router.replace("/")
      return
    }
    fetchFavorites(token)
      .then(setList)
      .finally(() => setLoading(false))
  }, [user, token, router])

  if (!user || user.role === "admin") {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/30 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold tracking-wide text-accent uppercase flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                Favoritos
              </span>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground md:text-4xl">
                Mis locales favoritos
              </h1>
              <p className="max-w-xl text-muted-foreground leading-relaxed">
                Los negocios que guardaste para ver después
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Cargando favoritos…</p>
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Aún no tenés favoritos</h2>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Cuando agregues un local a favoritos desde su página, aparecerá aquí.
              </p>
              <Button asChild className="mt-2">
                <Link href="/negocios">Explorar negocios</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
