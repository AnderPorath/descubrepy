"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { UserMenu } from "@/components/user-menu"
import { Magnetic } from "@/components/motion/primitives"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Descuentos", href: "/descuentos" },
  { label: "Destacados", href: "/destacados" },
  { label: "Categorias", href: "/categorias" },
  { label: "Negocios", href: "/negocios" },
  { label: "Anunciate", href: "/contacto" },
]

const EASE_OUT = [0.22, 1, 0.36, 1] as const

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const { user, isLoading } = useAuth()
  const pathname = usePathname() ?? "/"

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 12)
    setHidden(y > 240 && y > prev + 2 && !mobileOpen)
    if (y < prev - 2) setHidden(false)
  })

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
    <motion.header
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-black/5 bg-white/75 shadow-[0_8px_30px_-12px_rgba(7,18,51,0.18)] backdrop-blur-xl backdrop-saturate-150"
          : "border-border bg-white",
      )}
    >
      <nav
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 transition-[padding] duration-300 lg:px-8",
          scrolled ? "py-1.5" : "py-2",
        )}
      >
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center" aria-label="Ir al inicio">
          <motion.span
            className="block"
            whileHover={{ scale: 1.04, rotate: -1.5 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <Image
              src="/images/logo-v303.png"
              alt="DescubrePY - Tu guia digital de Paraguay"
              width={360}
              height={108}
              className={cn("w-auto transition-[height] duration-300", scrolled ? "h-9" : "h-10")}
              priority
            />
          </motion.span>
        </Link>

        {/* Desktop nav links */}
        <ul
          className="hidden items-center gap-1 lg:flex xl:gap-2"
          onMouseLeave={() => setHovered(null)}
        >
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <li key={link.label} className="relative">
                <Link
                  href={link.href}
                  onMouseEnter={() => setHovered(link.href)}
                  onFocus={() => setHovered(link.href)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative isolate block rounded-full px-3.5 py-2 text-sm font-medium transition-colors xl:px-4",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {hovered === link.href ? (
                    <motion.span
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-neutral-100"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  {link.label}
                  {active ? (
                    <motion.span
                      layoutId="nav-active-bar"
                      className="absolute inset-x-3 -bottom-[3px] h-[2px] rounded-full bg-gradient-to-r from-[#E52B2B] via-neutral-300 to-[#0038A8]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                </Link>
              </li>
            )
          })}
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
                  className="cursor-pointer rounded-full text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={openLogin}
                >
                  Iniciar sesion
                </Button>
                <Magnetic strength={0.25}>
                  <Button
                    className="group relative cursor-pointer overflow-hidden rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    onClick={openRegister}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-[320%]"
                    />
                    <span className="relative">Registrarse</span>
                  </Button>
                </Magnetic>
              </>
            ))}
        </div>

        {/* Mobile: user menu + hamburger */}
        <div className="flex items-center gap-1.5 lg:hidden">
          {!isLoading && user ? <UserMenu compact /> : null}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            className="relative grid h-9 w-9 place-items-center rounded-full text-foreground transition hover:bg-neutral-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "x" : "menu"}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="grid place-items-center"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />

      {/* Mobile dropdown (solo navegación + auth si no hay sesión) */}
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="overflow-hidden border-t border-border bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <motion.ul
              className="flex flex-col gap-1 px-4 py-3"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
            >
              {navLinks.map((link) => {
                const active = isActive(pathname, link.href)
                return (
                  <motion.li
                    key={link.label}
                    variants={{
                      hidden: { opacity: 0, x: -12 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE_OUT } },
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-neutral-100 text-foreground"
                          : "text-muted-foreground hover:bg-neutral-50 hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full transition-colors",
                          active ? "bg-[#E52B2B]" : "bg-neutral-300",
                        )}
                      />
                      {link.label}
                    </Link>
                  </motion.li>
                )
              })}
            </motion.ul>
            {!isLoading && !user ? (
              <div className="flex flex-col gap-2 px-4 pb-4">
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
