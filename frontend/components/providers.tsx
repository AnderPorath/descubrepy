"use client"

import { MotionConfig } from "motion/react"
import { AuthProvider } from "@/contexts/auth-context"
import { ScrollProgress } from "@/components/motion/primitives"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <AuthProvider>{children}</AuthProvider>
    </MotionConfig>
  )
}
