"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BusinessQrCard } from "@/components/business/business-qr-card"
import type { BusinessDetailApi } from "@/lib/api"

const getApiBase = () =>
  typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL ?? "") : ""

export default function NegocioQrPage() {
  const params = useParams()
  const slug = typeof params?.slug === "string" ? params.slug : ""
  const [business, setBusiness] = useState<BusinessDetailApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    fetch(`${getApiBase()}/api/businesses/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (cancelled) return
        if (!res.ok) {
          setNotFound(true)
          setBusiness(null)
          return
        }
        const data = (await res.json()) as BusinessDetailApi
        setBusiness(data)
        setNotFound(false)
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true)
          setBusiness(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 lg:py-12">
          <Link
            href={slug ? `/negocio/${slug}` : "/negocios"}
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al local
          </Link>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notFound || !business ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
              No encontramos ese local.
            </div>
          ) : (
            <BusinessQrCard
              slug={business.slug}
              name={business.name}
              city={business.city}
              category={business.category}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
