"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

export type User = { id: number; name: string; email: string; role: string }

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = "descubrepy_auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const data = JSON.parse(raw)
        if (data?.user && data?.token) {
          setUser(data.user)
          setToken(data.token)
        }
      }
    } catch {
      // ignore
    }
    setIsLoading(false)
  }, [])

  const apiBase = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL ?? "") : ""

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error || "Error al iniciar sesión" }
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: data.user, token: data.token }))
      return {}
    } catch {
      return { error: "Error de conexión" }
    }
  }, [apiBase])

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error || "Error al registrarse" }
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: data.user, token: data.token }))
      return {}
    } catch {
      return { error: "Error de conexión" }
    }
  }, [apiBase])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser)
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const data = JSON.parse(raw)
        if (data?.token) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, user: newUser }))
        }
      }
    } catch {
      // ignore
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
