import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { FeaturedSectionClient } from "@/components/featured-section-client"
import { DiscountSectionClient } from "@/components/discount-section-client"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <DiscountSectionClient />
        <FeaturedSectionClient />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
