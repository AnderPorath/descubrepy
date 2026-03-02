"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X, LogOut, Building2, Heart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Destacados", href: "/destacados" },
  { label: "Categorias", href: "/categorias" },
  { label: "Negocios", href: "/negocios" },
  { label: "Anunciate", href: "/contacto" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const { user, logout, isLoading } = useAuth()

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
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="DescubrePY - Tu guia digital de Paraguay"
            width={180}
            height={48}
            className="h-10 w-auto"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-foreground">
              {"Descubre"}
              <span className="text-accent">PY</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Tu guia digital
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-10 lg:flex">
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
          {user && user.role === "user" && (
            <li>
              <Link
                href="/favoritos"
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Heart className="h-4 w-4" />
                Favoritos
              </Link>
            </li>
          )}
          {user?.role === "admin" && (
            <>
              <li>
                <Link
                  href="/clientes"
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Users className="h-4 w-4" />
                  Clientes
                </Link>
              </li>
              <li>
                <Link
                  href="/registrar-empresa"
                  className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/90"
                >
                  <Building2 className="h-4 w-4" />
                  Registrar empresa
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Desktop CTA buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          {!isLoading && (
            user ? (
              <>
                <Link href="/perfil" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  {user.name}
                </Link>
                <Button variant="ghost" size="sm" className="cursor-pointer gap-1.5 text-sm text-muted-foreground hover:text-foreground" onClick={() => logout()}>
                  <LogOut className="h-4 w-4" />
                  Cerrar sesion
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground" onClick={openLogin}>
                  Iniciar sesion
                </Button>
                <Button className="cursor-pointer rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90" onClick={openRegister}>
                  Registrarse
                </Button>
              </>
            )
          )}
        </div>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="text-foreground lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
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
            {user && user.role === "user" && (
              <li>
                <Link
                  href="/favoritos"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Heart className="h-4 w-4" />
                  Favoritos
                </Link>
              </li>
            )}
            {user?.role === "admin" && (
              <>
                <li>
                  <Link
                    href="/clientes"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Users className="h-4 w-4" />
                    Clientes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/registrar-empresa"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/90"
                  >
                    <Building2 className="h-4 w-4" />
                    Registrar empresa
                  </Link>
                </li>
              </>
            )}
          </ul>
          <div className="flex flex-col gap-2">
            {!isLoading && (
              user ? (
                <>
                  <Link href="/perfil" onClick={() => setMobileOpen(false)} className="block px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    {user.name}
                  </Link>
                  <Button variant="ghost" className="w-full cursor-pointer gap-1.5 text-sm text-muted-foreground hover:text-foreground" onClick={() => logout()}>
                    <LogOut className="h-4 w-4" />
                    Cerrar sesion
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground" onClick={openLogin}>
                    Iniciar sesion
                  </Button>
                  <Button className="w-full cursor-pointer rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90" onClick={openRegister}>
                    Registrarse
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  )
}
