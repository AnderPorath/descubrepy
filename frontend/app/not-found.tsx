import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <h1 className="text-6xl font-bold text-neutral-700">404</h1>
        <p className="mt-2 text-neutral-600">Página no encontrada.</p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-[#002868] px-6 py-2 text-white hover:bg-[#001a45]"
        >
          Volver al inicio
        </Link>
      </main>
      <Footer />
    </div>
  )
}
