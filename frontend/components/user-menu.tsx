"use client"

import Link from "next/link"
import {
  Building2,
  ChevronDown,
  Heart,
  LogOut,
  UserRound,
  Users,
} from "lucide-react"
import { useAuth, type User } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
}

function UserAvatar({ user, className }: { user: User; className?: string }) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground",
        className
      )}
      aria-hidden
    >
      {getInitials(user.name)}
    </span>
  )
}

type UserMenuProps = {
  /** Compacto en mobile: solo avatar + flecha */
  compact?: boolean
  onNavigate?: () => void
}

export function UserMenu({ compact = false, onNavigate }: UserMenuProps) {
  const { user, logout } = useAuth()
  if (!user) return null

  const isAdmin = user.role === "admin"
  const isClient = user.role === "user"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group inline-flex max-w-[14rem] items-center gap-2 rounded-full border border-transparent bg-transparent py-1 pl-1 pr-2 text-left outline-none transition",
            "hover:border-neutral-200 hover:bg-neutral-50",
            "focus-visible:border-neutral-200 focus-visible:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary/15",
            "data-[state=open]:border-neutral-200 data-[state=open]:bg-neutral-50"
          )}
          aria-label="Menú de usuario"
        >
          <UserAvatar user={user} />
          {!compact ? (
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800">
              {user.name}
            </span>
          ) : null}
          <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={cn(
          "w-64 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-1.5",
          "shadow-[0_12px_40px_-12px_rgba(15,23,42,0.28)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100",
          "duration-200"
        )}
      >
        <DropdownMenuLabel className="rounded-xl px-3 py-2.5 font-normal">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} className="h-9 w-9 text-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">{user.name}</p>
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="mx-1 my-1.5 bg-neutral-100" />

        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-xl px-3 py-2.5 text-sm text-neutral-700 focus:bg-neutral-50 focus:text-neutral-900"
        >
          <Link href="/perfil" onClick={onNavigate}>
            <UserRound className="h-4 w-4 text-neutral-400" />
            Mi perfil
          </Link>
        </DropdownMenuItem>

        {isClient ? (
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl px-3 py-2.5 text-sm text-neutral-700 focus:bg-neutral-50 focus:text-neutral-900"
          >
            <Link href="/favoritos" onClick={onNavigate}>
              <Heart className="h-4 w-4 text-neutral-400" />
              Favoritos
            </Link>
          </DropdownMenuItem>
        ) : null}

        {isAdmin ? (
          <>
            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-xl px-3 py-2.5 text-sm text-neutral-700 focus:bg-neutral-50 focus:text-neutral-900"
            >
              <Link href="/clientes" onClick={onNavigate}>
                <Users className="h-4 w-4 text-neutral-400" />
                Clientes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-xl px-3 py-2.5 text-sm text-neutral-700 focus:bg-neutral-50 focus:text-neutral-900"
            >
              <Link href="/registrar-empresa" onClick={onNavigate}>
                <Building2 className="h-4 w-4 text-neutral-400" />
                Registrar empresa
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}

        <DropdownMenuSeparator className="mx-1 my-1.5 bg-neutral-100" />

        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer rounded-xl px-3 py-2.5 text-sm focus:bg-red-50"
          onSelect={() => {
            onNavigate?.()
            logout()
          }}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
