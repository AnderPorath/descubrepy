import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://127.0.0.1:6000"

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization")
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    let meRes: Response
    try {
      meRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error("Backend no alcanzable:", msg)
      return NextResponse.json(
        {
          error: "El backend no responde. Verificá que esté corriendo (npm run dev en /backend). Si usás un IDE remoto, creá frontend/.env.local con BACKEND_URL=http://127.0.0.1:6000",
          detail: process.env.NODE_ENV === "development" ? msg : undefined,
        },
        { status: 503 }
      )
    }
    if (!meRes.ok) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const me = await meRes.json()
    if (me?.user?.role !== "admin") {
      return NextResponse.json({ error: "Solo administradores pueden subir imágenes" }, { status: 403 })
    }
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: "Error al recibir la imagen. Probá con una foto más chica." },
        { status: 413 }
      )
    }
    const file = formData.get("image")
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Se requiere un archivo de imagen" }, { status: 400 })
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    const contentType = file.type || "image/jpeg"
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg"
    await mkdir(UPLOAD_DIR, { recursive: true })
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
    const filePath = path.join(UPLOAD_DIR, name)
    await writeFile(filePath, buffer)
    return NextResponse.json({ url: `/uploads/${name}` })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 })
  }
}
