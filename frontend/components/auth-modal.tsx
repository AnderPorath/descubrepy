"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

type AuthModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: "login" | "register"
}

export function AuthModal({
  open,
  onOpenChange,
  defaultMode = "login",
}: AuthModalProps) {
  const { login, register } = useAuth()
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setActiveTab(defaultMode)
  }, [open, defaultMode])

  const resetForm = () => {
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setError("")
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm()
    onOpenChange(next)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error: err } = await login(email.trim(), password)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    handleOpenChange(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }
    setLoading(true)
    const { error: err } = await register(name.trim(), email.trim(), password)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px] gap-0 p-0 overflow-hidden border-none shadow-2xl">
        {/* Header */}
        <div className="bg-primary px-6 pt-8 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl font-bold text-primary-foreground tracking-tight">
              Descubre
            </span>
            <span className="text-2xl font-bold text-accent tracking-tight">
              PY
            </span>
          </div>
          <DialogHeader className="items-center">
            <DialogTitle className="sr-only">
              {activeTab === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/70 text-sm">
              Tu guía digital de Paraguay
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-5 pb-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as "login" | "register")
              setError("")
            }}
          >
            <TabsList className="w-full h-11 bg-secondary rounded-lg p-1 mb-5">
              <TabsTrigger
                value="login"
                className="flex-1 h-full rounded-md text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                Iniciar sesión
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 h-full rounded-md text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                Registrarse
              </TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login" className="mt-0">
              <form
                onSubmit={handleLogin}
                className="flex flex-col gap-4"
              >
                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-center">
                    {error}
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="login-email" className="text-foreground/80">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="pl-10 h-11 bg-secondary/50 border-border/60 focus-visible:border-accent focus-visible:ring-accent/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-foreground/80">
                      Contraseña
                    </Label>
                    <button
                      type="button"
                      className="text-xs text-accent hover:text-accent/80 font-medium transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pl-10 pr-10 h-11 bg-secondary/50 border-border/60 focus-visible:border-accent focus-visible:ring-accent/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 mt-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                >
                  {loading ? "Entrando…" : "Iniciar sesión"}
                </Button>
              </form>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register" className="mt-0">
              <form
                onSubmit={handleRegister}
                className="flex flex-col gap-4"
              >
                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-center">
                    {error}
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="register-name" className="text-foreground/80">
                    Nombre completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                      className="pl-10 h-11 bg-secondary/50 border-border/60 focus-visible:border-accent focus-visible:ring-accent/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="register-email" className="text-foreground/80">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="pl-10 h-11 bg-secondary/50 border-border/60 focus-visible:border-accent focus-visible:ring-accent/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="register-password" className="text-foreground/80">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="pl-10 pr-10 h-11 bg-secondary/50 border-border/60 focus-visible:border-accent focus-visible:ring-accent/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="register-confirm" className="text-foreground/80">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="register-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repetí tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="pl-10 pr-10 h-11 bg-secondary/50 border-border/60 focus-visible:border-accent focus-visible:ring-accent/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 mt-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                >
                  {loading ? "Creando…" : "Crear cuenta"}
                </Button>

                <p className="text-center text-xs text-muted-foreground leading-relaxed">
                  Al registrarte, aceptás nuestros{" "}
                  <Link href="/terminos-de-servicio" className="text-accent hover:text-accent/80 underline underline-offset-2 transition-colors" onClick={() => onOpenChange(false)}>
                    Términos de servicio
                  </Link>
                  {" y "}
                  <Link href="/politica-de-privacidad" className="text-accent hover:text-accent/80 underline underline-offset-2 transition-colors" onClick={() => onOpenChange(false)}>
                    Política de privacidad
                  </Link>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
