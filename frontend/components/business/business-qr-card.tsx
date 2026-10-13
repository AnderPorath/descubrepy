"use client"

import { useCallback, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.descubrepy.com.py"
).replace(/\/$/, "")

type Props = {
  slug: string
  name: string
  city?: string | null
  category?: string | null
}

export function BusinessQrCard({ slug, name, city, category }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const targetUrl = `${SITE_URL}/negocio/${encodeURIComponent(slug)}`

  const downloadPng = useCallback(() => {
    const svg = wrapRef.current?.querySelector("svg")
    if (!svg) return

    const serializer = new XMLSerializer()
    const svgText = serializer.serializeToString(svg)
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const size = 1024
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        URL.revokeObjectURL(url)
        return
      }
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(url)

      const a = document.createElement("a")
      a.href = canvas.toDataURL("image/png")
      a.download = `qr-${slug}.png`
      a.click()
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }, [slug])

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          QR del local
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
          {name}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {[category, city].filter(Boolean).join(" · ") || "DescubrePy"}
        </p>
      </div>

      <div
        ref={wrapRef}
        className="mx-auto mt-6 flex w-fit items-center justify-center rounded-2xl border border-neutral-100 bg-white p-4"
      >
        <QRCodeSVG
          value={targetUrl}
          size={240}
          level="M"
          includeMargin
          bgColor="#ffffff"
          fgColor="#0a0a0a"
        />
      </div>

      <p className="mt-4 break-all text-center text-xs text-neutral-400">
        {targetUrl}
      </p>
      <p className="mt-2 text-center text-sm text-neutral-600">
        Al escanear, se abre la ficha del local en DescubrePy.
      </p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="flex-1 gap-2" onClick={downloadPng}>
          <Download className="h-4 w-4" />
          Descargar PNG
        </Button>
        <Button type="button" variant="outline" className="flex-1 gap-2" asChild>
          <a href={targetUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Ver ficha
          </a>
        </Button>
      </div>
    </div>
  )
}
