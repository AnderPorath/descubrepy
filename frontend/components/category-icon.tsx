"use client"

import {
  CookingPot,
  Scissors,
  Barbell,
  Coffee,
  FirstAid,
  Wrench,
  Handbag,
  Buildings,
  GraduationCap,
  Car,
  Briefcase,
  Heart,
  Dog,
  Scales,
  House,
  Pill,
  ShoppingCart,
  Camera,
  CalendarBlank,
  DeviceMobile,
  type IconProps,
} from "@phosphor-icons/react"

const sizeMap = { default: 28, sm: 24, lg: 36, xl: 48 }

type SizeKey = keyof typeof sizeMap

type IconComponent = (props: IconProps) => JSX.Element

const iconMap: Record<string, IconComponent> = {
  UtensilsCrossed: CookingPot,
  UtensilsCross: CookingPot,
  Scissors,
  Dumbbell: Barbell,
  Coffee,
  Stethoscope: FirstAid,
  Wrench,
  ShoppingBag: Handbag,
  Building2: Buildings,
  GraduationCap,
  Car,
  Briefcase,
  Heart,
  Dog,
  Scale: Scales,
  Scales,
  Home: House,
  Pill,
  ShoppingCart,
  Camera,
  Calendar: CalendarBlank,
  Smartphone: DeviceMobile,
}

type Props = {
  iconName: string
  size?: SizeKey
  variant?: "default" | "onDark" | "muted"
  className?: string
  iconClassName?: string
}

export function CategoryIcon({ iconName, size = "default", variant = "default", className = "", iconClassName = "" }: Props) {
  const IconComponent = iconMap[iconName] ?? Wrench
  const px = sizeMap[size]
  const isOnDark = variant === "onDark"
  const isMuted = variant === "muted"
  const containerClass = isOnDark
    ? "bg-primary-foreground/10"
    : isMuted
      ? "bg-secondary/50"
      : "bg-gradient-to-br from-primary/15 to-primary/5"
  const iconColor = isOnDark ? "var(--primary-foreground)" : isMuted ? "var(--muted-foreground)" : "var(--primary)"

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl shadow-sm ${containerClass} ${className}`}
      style={{ width: px + 16, height: px + 16, minWidth: px + 16, minHeight: px + 16 }}
    >
      <IconComponent
        weight="duotone"
        size={px}
        className={iconClassName || (isOnDark ? "text-primary-foreground" : isMuted ? "text-muted-foreground" : "text-primary")}
        style={{ color: iconColor }}
      />
    </div>
  )
}
