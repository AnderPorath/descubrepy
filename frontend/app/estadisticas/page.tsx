"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { EstadisticasAdmin } from "@/components/admin/estadisticas-admin"
import { useAuth } from "@/contexts/auth-context"

export default function EstadisticasPage() {
  const router = useRouter()
  const { user, token, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!user || !token) {
      router.replace("/")
      return
    }
    if (user.role !== "admin") {
      router.replace("/")
    }
  }, [user, token, isLoading, router])

  if (isLoading || !user || user.role !== "admin" || !token) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8 lg:py-10">
          <EstadisticasAdmin token={token} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
