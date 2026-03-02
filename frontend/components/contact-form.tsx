"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, CheckCircle2, Loader2 } from "lucide-react"
import { submitContactForm } from "@/lib/api"

const categories = [
  "Restaurante / Gastronomía",
  "Salud y Bienestar",
  "Educación",
  "Tecnología",
  "Automotriz",
  "Belleza y Estética",
  "Hogar y Construcción",
  "Servicios Profesionales",
  "Entretenimiento",
  "Otro",
]

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categoria, setCategoria] = useState("")

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Solicitud enviada</h3>
        <p className="text-sm text-slate-600 max-w-xs">
          Recibimos tu solicitud. Nos pondremos en contacto con vos a la brevedad.
        </p>
        <Button
          variant="outline"
          onClick={() => setSubmitted(false)}
          className="mt-2 border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Enviar otra solicitud
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
      <h2 className="text-xl font-bold text-slate-900">
        Solicitá tu publicación
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Completá los datos y te contactamos a la brevedad.
      </p>

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          const form = e.currentTarget
          const nombre = (form.querySelector('#nombre') as HTMLInputElement)?.value?.trim() ?? ""
          const telefono = (form.querySelector('#telefono') as HTMLInputElement)?.value?.trim() ?? ""
          const email = (form.querySelector('#email') as HTMLInputElement)?.value?.trim() ?? ""
          const negocio = (form.querySelector('#negocio') as HTMLInputElement)?.value?.trim() ?? ""
          const ciudad = (form.querySelector('#ciudad') as HTMLInputElement)?.value?.trim() ?? ""
          const mensaje = (form.querySelector('#mensaje') as HTMLTextAreaElement)?.value?.trim() ?? ""
          if (!nombre || !email) {
            setError("Nombre y email son obligatorios.")
            return
          }
          setSending(true)
          const result = await submitContactForm({
            nombre,
            telefono: telefono || undefined,
            email,
            negocio: negocio || undefined,
            categoria: categoria || undefined,
            ciudad: ciudad || undefined,
            mensaje: mensaje || undefined,
          })
          setSending(false)
          if (result.error) {
            setError(result.error)
            return
          }
          setSubmitted(true)
        }}
        className="mt-6 flex flex-col gap-5"
      >
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre" className="text-slate-700">Nombre completo</Label>
            <Input id="nombre" name="nombre" placeholder="Tu nombre" required className="rounded-lg border-slate-200" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="telefono" className="text-slate-700">Teléfono / WhatsApp</Label>
            <Input id="telefono" name="telefono" placeholder="+595 9xx xxx xxx" required className="rounded-lg border-slate-200" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-slate-700">Email</Label>
          <Input id="email" name="email" type="email" placeholder="tu@email.com" required className="rounded-lg border-slate-200" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="negocio" className="text-slate-700">Nombre del negocio</Label>
          <Input id="negocio" name="negocio" placeholder="Nombre de tu empresa" required className="rounded-lg border-slate-200" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="categoria" className="text-slate-700">Categoría</Label>
          <Select required value={categoria} onValueChange={setCategoria}>
            <SelectTrigger id="categoria" className="w-full rounded-lg border-slate-200">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="ciudad" className="text-slate-700">Ciudad</Label>
          <Input
            id="ciudad"
            name="ciudad"
            placeholder="Ej: Asunción, Ciudad del Este..."
            required
            className="rounded-lg border-slate-200"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="mensaje" className="text-slate-700">
            Mensaje <span className="font-normal text-slate-500">(opcional)</span>
          </Label>
          <Textarea
            id="mensaje"
            name="mensaje"
            placeholder="Contanos un poco sobre tu negocio..."
            className="min-h-24 resize-none rounded-lg border-slate-200"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={sending}
          className="mt-1 w-full rounded-lg bg-slate-800 text-white hover:bg-slate-700"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? "Enviando…" : "Enviar solicitud"}
        </Button>

        <p className="text-center text-xs text-slate-500 mt-3">
          Al enviar aceptás nuestros{" "}
          <a href="#" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
            términos y condiciones
          </a>
        </p>
      </form>
    </div>
  )
}
