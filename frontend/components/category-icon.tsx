"use client"

import { getCategoryEmoji, getSubcategoryEmoji } from "@/lib/category-emojis"

const sizeMap = { default: 44, sm: 36, lg: 52, xl: 64 }

type SizeKey = keyof typeof sizeMap

type Props = {
  /** Slug de la categoría (ej. gastronomia, pizzeria). */
  categorySlug: string
  /** Si se pasa, se muestra el emoji de la subcategoría (ej. pizzeria → 🍕). */
  subcategorySlug?: string
  size?: SizeKey
  variant?: "default" | "onDark" | "muted"
  className?: string
}

export function CategoryIcon({
  categorySlug,
  subcategorySlug,
  size = "default",
  variant = "default",
  className = "",
}: Props) {
  const emoji =
    subcategorySlug != null && subcategorySlug !== ""
      ? getSubcategoryEmoji(categorySlug, subcategorySlug)
      : getCategoryEmoji(categorySlug)

  const px = sizeMap[size]
  const isOnDark = variant === "onDark"
  const isMuted = variant === "muted"
  const containerClass = isOnDark
    ? "bg-primary-foreground/10"
    : isMuted
      ? "bg-secondary/50"
      : "bg-gradient-to-br from-primary/15 to-primary/5"

  const emojiSize = Math.round(px * 0.6)

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl shadow-sm ${containerClass} ${className}`}
      style={{ width: px, height: px, minWidth: px, minHeight: px }}
    >
      <span className="leading-none" style={{ fontSize: emojiSize }}>
        {emoji}
      </span>
    </div>
  )
}
