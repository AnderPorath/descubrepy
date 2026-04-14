"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Tag } from "lucide-react"
import { BusinessCard } from "@/components/business-card"
import { fetchDiscounts, type BusinessApi } from "@/lib/api"

export function DescuentosList() {
  const [items, setItems] = useState<BusinessApi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchDiscounts()
      .then((list) => {
        if (!cancelled) setItems(Array.isArray(list) ? list : [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando descuentos…</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Tag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Aún no hay descuentos</h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Cuando cargues un porcentaje al registrar o editar un local, aparecerá acá.
          </p>
          <Link href="/negocios" className="mt-2 text-sm font-medium text-primary hover:underline">
            Ver todos los negocios
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "local con descuento" : "locales con descuento"}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
