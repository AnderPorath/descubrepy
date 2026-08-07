"use client"

export type AnalyticsEventType =
  | "profile_view"
  | "whatsapp_click"
  | "phone_click"
  | "instagram_click"
  | "share_click"
  | "coupon_claim"
  | "coupon_used"

const SESSION_KEY = "descubrepy_sid"

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
}

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return ""
  try {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = uuid()
      localStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return uuid()
  }
}

/** Registra un evento de interacción (fire-and-forget). */
export function trackBusinessEvent(params: {
  businessId?: number | null
  slug?: string | null
  eventType: AnalyticsEventType
}): void {
  if (typeof window === "undefined") return
  const { businessId, slug, eventType } = params
  if (!businessId && !slug) return

  const body: Record<string, unknown> = {
    event_type: eventType,
    session_id: getAnalyticsSessionId(),
  }
  if (businessId) body.business_id = businessId
  if (slug) body.slug = slug

  const base = process.env.NEXT_PUBLIC_API_URL ?? ""
  const url = `${base}/api/analytics/event`

  try {
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignore
  }
}
