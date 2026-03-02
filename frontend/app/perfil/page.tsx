"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { updateProfile } from "@/lib/api"
import { User } from "lucide-react"

export default function PerfilPage() {
  const router = useRouter()
  const { user, token, updateUser } = useAuth()
  const [name, setName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!user || !token) {
      router.replace("/iniciar-sesion")
      return
    }
    setName(user.name)
  }, [user, token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!user || !token) return

    const newPass = newPassword.trim()
    const currPass = currentPassword.trim()
    if (newPass.length > 0) {
      if (currPass.length === 0) {
        setMessage({ type: "error", text: "Ingresá tu contraseña actual para cambiar la contraseña." })
        return
      }
      if (newPass.length < 6) {
        setMessage({ type: "error", text: "La nueva contraseña debe tener al menos 6 caracteres." })
        return
      }
      if (newPass !== confirmPassword) {
        setMessage({ type: "error", text: "La nueva contraseña y la confirmación no coinciden." })
        return
      }
    }

    setSaving(true)
    try {
      const payload: { name?: string; current_password?: string; new_password?: string } = {}
      const trimmedName = name.trim()
      if (trimmedName) payload.name = trimmedName
      if (newPass) {
        payload.current_password = currPass
        payload.new_password = newPass
      }
      if (!payload.name && !payload.new_password) {
        setMessage({ type: "error", text: "Cambiá tu nombre y/o completá los campos de contraseña." })
        setSaving(false)
        return
      }
      const result = await updateProfile(payload, token)
      if (result.error) {
        setMessage({ type: "error", text: result.error })
        setSaving(false)
        return
      }
      if (result.user) {
        updateUser(result.user)
        setMessage({ type: "success", text: "Perfil actualizado correctamente." })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión." })
    }
    setSaving(false)
  }

  if (!user || !token) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/30 py-5 sm:py-6 lg:py-7">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-accent uppercase">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <User className="h-3 w-3" />
                </span>
                Mi cuenta
              </span>
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Editar perfil
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground leading-relaxed">
                Actualizá tu nombre y contraseña cuando quieras.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-lg">
            {/* Email (solo lectura) */}
            <div className="mb-10 rounded-xl border border-border bg-muted/30 px-5 py-4 sm:px-6 sm:py-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email de la cuenta
              </p>
              <p className="mt-1.5 text-sm font-medium text-foreground">{user.email}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 sm:gap-10 lg:p-10">
              <div className="space-y-4">
                <Label htmlFor="profile-name" className="text-sm font-medium">
                  Nombre
                </Label>
                <Input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-6 border-t border-border pt-8 sm:pt-10">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Cambiar contraseña</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Dejá los campos en blanco si no querés cambiar la contraseña.
                  </p>
                </div>
                <div className="grid gap-5 sm:gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="current-password" className="text-xs font-medium">
                      Contraseña actual
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Solo si vas a cambiar la contraseña"
                      autoComplete="current-password"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="new-password" className="text-xs font-medium">
                      Nueva contraseña
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="confirm-password" className="text-xs font-medium">
                      Confirmar nueva contraseña
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repetí la nueva contraseña"
                      autoComplete="new-password"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {message && (
                <div
                  className={`rounded-lg px-4 py-3 text-xs ${message.type === "success" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <Button type="submit" disabled={saving} className="h-9 px-5 text-sm sm:px-6">
                  {saving ? "Guardando…" : "Guardar cambios"}
                </Button>
                <Button type="button" variant="outline" asChild className="h-9 text-sm">
                  <Link href="/">Volver al inicio</Link>
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
