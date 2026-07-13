import type { Metadata } from "next"
import { NegocioDetailContent } from "@/components/business/negocio-detail-content"
import { fetchBusinessBySlug, getImageUrl } from "@/lib/api"

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.descubrepy.com.py").replace(/\/$/, "")

function absoluteImageUrl(url: string | null | undefined): string | null {
  const resolved = getImageUrl(url)
  if (!resolved) return null
  if (resolved.startsWith("http://") || resolved.startsWith("https://")) return resolved
  if (resolved.startsWith("/")) return `${SITE_URL}${resolved}`
  return resolved
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const business = await fetchBusinessBySlug(slug)

  if (!business) {
    return {
      title: "Negocio no encontrado - DescubrePY",
      description: "Este negocio no está disponible en DescubrePY.",
    }
  }

  const title = `${business.name} - DescubrePY`
  const locationBits = [business.location, business.city].filter(Boolean).join(", ")
  const description =
    (business.description?.trim() && business.description.trim().slice(0, 160)) ||
    `${business.name}${business.category ? ` · ${business.category}` : ""}${locationBits ? ` en ${locationBits}` : ""} | DescubrePY`

  const imageUrl =
    absoluteImageUrl(business.image_url) ||
    absoluteImageUrl(business.gallery_images?.[0]) ||
    `${SITE_URL}/images/logo-v303.png`

  const pageUrl = `${SITE_URL}/negocio/${encodeURIComponent(business.slug)}`

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "website",
      locale: "es_PY",
      url: pageUrl,
      siteName: "DescubrePY",
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: business.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default function NegocioSlugPage() {
  return <NegocioDetailContent />
}
