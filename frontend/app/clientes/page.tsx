"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/auth-context"
import {
  fetchUsers,
  updateClient,
  deleteClient,
  type ClientUser,
} from "@/lib/api"
import { Users, Pencil, Trash2 } from "lucide-react"

function formatDate(s: string) {
  try {
    const d = new Date(s)
    return d.toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

export default function ClientesPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [list, setList] = useState<ClientUser[]>([])
  const [loading, setLoading] = useState(true)
  const [editClient, setEditClient] = useState<ClientUser | null>(null)
  const [deleteClientRow, setDeleteClientRow] = useState<ClientUser | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const load = () => {
    if (!token) return
    fetchUsers(token)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user || !token) {
      router.replace("/iniciar-sesion")
      return
    }
    if (user.role !== "admin") {
      router.replace("/")
      return
    }
    load()
  }, [user, token, router])

  const openEdit = (client: ClientUser) => {
    setEditClient(client)
    setEditName(client.name)
    setEditEmail(client.email)
    setEditPassword("")
    setMessage(null)
  }

  const handleSaveEdit = async () => {
    if (!editClient || !token) return
    setMessage(null)
    const name = editName.trim()
    const email = editEmail.trim().toLowerCase()
    if (!name || !email) {
      setMessage({ type: "error", text: "Nombre y email son obligatorios." })
      return
    }
    if (editPassword.length > 0 && editPassword.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres." })
      return
    }
    setSaving(true)
    try {
      const payload: { name?: string; email?: string; new_password?: string } = {
        name,
        email,
      }
      if (editPassword.trim()) payload.new_password = editPassword.trim()
      const result = await updateClient(editClient.id, payload, token)
      if (result.error) {
        setMessage({ type: "error", text: result.error })
        setSaving(false)
        return
      }
      if (result.user) {
        setList((prev) =>
          prev.map((u) => (u.id === result.user!.id ? result.user! : u))
        )
        setEditClient(null)
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión." })
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    const client = deleteClientRow
    if (!client || !token) return
    setDeleting(true)
    try {
      const result = await deleteClient(client.id, token)
      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else {
        setList((prev) => prev.filter((u) => u.id !== client.id))
        setDeleteClientRow(null)
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión." })
    }
    setDeleting(false)
  }

  if (!user || user.role !== "admin") {
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
                  <Users className="h-3 w-3" />
                </span>
                Administración
              </span>
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Clientes
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground leading-relaxed">
                Usuarios registrados. Podés editar o eliminar cada uno.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {message && (
            <div
              className={`mb-4 rounded-lg px-4 py-3 text-sm ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Cargando clientes…</p>
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">No hay clientes registrados</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Los usuarios que se registren aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 font-medium text-foreground">Nombre</th>
                    <th className="px-4 py-3 font-medium text-foreground">Email</th>
                    <th className="px-4 py-3 font-medium text-foreground">Fecha registro</th>
                    <th className="px-4 py-3 font-medium text-foreground text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{client.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{client.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(client.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(client)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteClientRow(client)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Modal Editar */}
      <Dialog
        open={!!editClient}
        onOpenChange={(open) => {
          if (!open) {
            setEditClient(null)
            setMessage(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nombre"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="email@ejemplo.com"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Nueva contraseña (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Dejar en blanco para no cambiar"
                className="h-9 text-sm"
              />
            </div>
            {message && editClient && (
              <p className={`text-xs ${message.type === "error" ? "text-destructive" : "text-green-600"}`}>
                {message.text}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditClient(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminar */}
      <AlertDialog
        open={!!deleteClientRow}
        onOpenChange={(open) => !open && setDeleteClientRow(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a <strong>{deleteClientRow?.name}</strong> ({deleteClientRow?.email}).
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => {
                handleDelete()
              }}
            >
              {deleting ? "Eliminando…" : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
