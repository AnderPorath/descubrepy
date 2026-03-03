import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://127.0.0.1:6000").replace(/\/$/, "")

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
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
    const isBlob = file != null && typeof (file as Blob).arrayBuffer === "function"
    if (!file || !isBlob) {
      return NextResponse.json({ error: "Se requiere un archivo de imagen" }, { status: 400 })
    }

    // Reenviar al backend para que guarde el archivo (en Vercel el disco es de solo lectura)
    const backendForm = new FormData()
    backendForm.set("image", file as Blob, (file as File).name || "image.jpg")

    let backendRes: Response
    try {
      backendRes = await fetch(`${BACKEND_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: auth },
        body: backendForm,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error("Backend no alcanzable:", msg)
      return NextResponse.json(
        {
          error: "El backend no responde. Verificá que esté corriendo (npm run dev en /backend). En producción, revisá NEXT_PUBLIC_API_URL.",
          detail: process.env.NODE_ENV === "development" ? msg : undefined,
        },
        { status: 503 }
      )
    }

    const data = await backendRes.json().catch(() => ({}))
    if (!backendRes.ok) {
      const status = backendRes.status
      const message = data?.error || "Error al subir la imagen"
      return NextResponse.json(
        { error: message, detail: data?.detail },
        { status: status >= 400 && status < 600 ? status : 500 }
      )
    }

    // Devolver URL absoluta del backend para que la imagen se cargue desde ahí
    const relativePath = typeof data?.url === "string" ? data.url.replace(/^\//, "") : ""
    const url = relativePath ? `${BACKEND_URL}/${relativePath}` : `${BACKEND_URL}/uploads/fallback`
    return NextResponse.json({ url })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json(
      { error: "Error al subir la imagen", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
