import type { Metadata } from "next"
import { NegocioDetailContent } from "@/components/business/negocio-detail-content"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `${decodeURIComponent(slug)} - DescubrePY`,
    description: `Ver información del negocio en DescubrePY`,
  }
}

export default function NegocioSlugPage() {
  return <NegocioDetailContent />
}
