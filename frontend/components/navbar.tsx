"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { UserMenu } from "@/components/user-menu"

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Descuentos", href: "/descuentos" },
  { label: "Destacados", href: "/destacados" },
  { label: "Categorias", href: "/categorias" },
  { label: "Negocios", href: "/negocios" },
  { label: "Anunciate", href: "/contacto" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const { user, isLoading } = useAuth()

  const openLogin = () => {
    setAuthMode("login")
    setAuthOpen(true)
    setMobileOpen(false)
  }
  const openRegister = () => {
    setAuthMode("register")
    setAuthOpen(true)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/images/logo-v303.png"
            alt="DescubrePY - Tu guia digital de Paraguay"
            width={360}
            height={108}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-7 xl:gap-10 lg:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 lg:flex">
          {!isLoading &&
            (user ? (
              <UserMenu />
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={openLogin}
                >
                  Iniciar sesion
                </Button>
                <Button
                  className="cursor-pointer rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  onClick={openRegister}
                >
                  Registrarse
                </Button>
              </>
            ))}
        </div>

        {/* Mobile: user menu + hamburger */}
        <div className="flex items-center gap-1.5 lg:hidden">
          {!isLoading && user ? <UserMenu compact /> : null}
          <button
            type="button"
            className="rounded-lg p-1.5 text-foreground transition hover:bg-neutral-50"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />

      {/* Mobile dropdown (solo navegación + auth si no hay sesión) */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 lg:hidden">
          <ul className="flex flex-col gap-3 py-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {!isLoading && !user ? (
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="w-full cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={openLogin}
              >
                Iniciar sesion
              </Button>
              <Button
                className="w-full cursor-pointer rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
                onClick={openRegister}
              >
                Registrarse
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </header>
  )
}
