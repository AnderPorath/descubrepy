"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, Share2, Instagram } from "lucide-react"
import type { BusinessDetailApi } from "@/lib/api"

function getWhatsAppNumber(phone: string | null | undefined): string {
  if (!phone?.trim()) return ""
  const digits = phone.replace(/\D/g, "")
  if (digits.length >= 9) return "595" + digits.slice(-9)
  return "595" + digits
}

function getInstagramUrl(value: string | null | undefined): string | null {
  const v = value?.trim()
  if (!v) return null
  if (/^https?:\/\//i.test(v)) return v
  const user = v.replace(/^@/, "").replace(/\/$/, "").split("/").pop() || ""
  if (!user) return null
  return `https://instagram.com/${user}`
}

export function QuickActions({ business }: { business: BusinessDetailApi }) {
  const phone = business.phone?.trim()
  const waNumber = getWhatsAppNumber(phone)
  const instagramUrl = getInstagramUrl(business.instagram_url)
  const [sharing, setSharing] = useState(false)

  const handleShare = async () => {
    if (sharing) return
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        setSharing(true)
        await navigator.share({
          title: business.name,
          url,
          text: `${business.name} - DescubrePY`,
        })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url)
      } catch {
        // ignore
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-bold text-foreground">Contactar ahora</h3>
      <div className="flex flex-col gap-2.5">
        {waNumber && (
          <Button
            className="w-full gap-2 bg-emerald-600 text-primary-foreground hover:bg-emerald-700"
            asChild
          >
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              Escribir por WhatsApp
            </a>
          </Button>
        )}
        {phone && (
          <Button variant="outline" className="w-full gap-2" asChild>
            <a href={`tel:${phone.replace(/\s/g, "")}`}>
              <Phone className="h-4 w-4" />
              Llamar
            </a>
          </Button>
        )}
        {instagramUrl && (
          <Button variant="outline" className="w-full gap-2" asChild>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          </Button>
        )}
      </div>

      <div className="flex gap-2.5">
        <Button variant="secondary" size="sm" className="w-full gap-1.5 text-xs" onClick={handleShare} disabled={sharing}>
          <Share2 className="h-3.5 w-3.5" />
          {sharing ? "Compartiendo…" : "Compartir"}
        </Button>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        {business.category && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Categoría</span>
            <span className="font-semibold text-foreground">{business.category}</span>
          </div>
        )}
        {business.city && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Ciudad</span>
            <span className="font-semibold text-foreground">{business.city}</span>
          </div>
        )}
      </div>
    </div>
  )
}
