"use client"

import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "motion/react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Aparece al entrar en pantalla (fade + desplazamiento). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
  ...rest
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
} & Omit<HTMLMotionProps<"div">, "children">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

const staggerParent = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger } }),
}

const staggerChild = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
}

/** Contenedor que anima a sus hijos <StaggerItem> en cascada. */
export function Stagger({
  children,
  className,
  stagger = 0.07,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  )
}

/**
 * Tarjeta con inclinación 3D que sigue al puntero y un brillo (spotlight).
 * En touch y con "reducir movimiento" queda estática.
 */
export function TiltCard({
  children,
  className,
  max = 8,
  glare = true,
}: {
  children: ReactNode
  className?: string
  max?: number
  glare?: boolean
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const spring = { stiffness: 220, damping: 18, mass: 0.4 }
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring)
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring)
  const gx = useTransform(px, (v) => `${v * 100}%`)
  const gy = useTransform(py, (v) => `${v * 100}%`)
  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, rgba(255,255,255,0.28), transparent 45%)`
  const [hover, setHover] = useState(false)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }

  const reset = () => {
    setHover(false)
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <div className="[perspective:1000px]">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={reset}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={reduce ? undefined : { y: -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={cn("relative h-full will-change-transform", className)}
      >
        {children}
        {glare && !reduce ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-soft-light"
            style={{ background: glareBg }}
            animate={{ opacity: hover ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          />
        ) : null}
      </motion.div>
    </div>
  )
}

/** Envuelve un botón/enlace para que "se acerque" al cursor. */
export function Magnetic({
  children,
  className,
  strength = 0.3,
}: {
  children: ReactNode
  className?: string
  strength?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(0, { stiffness: 250, damping: 15, mass: 0.3 })
  const y = useSpring(0, { stiffness: 250, damping: 15, mass: 0.3 })

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/** Número que cuenta desde 0 cuando entra en pantalla. */
export function CountUp({
  value,
  duration = 1.6,
  className,
}: {
  value: number
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value, duration, reduce])

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display.toLocaleString("es-PY")}
    </span>
  )
}

/** Barra fina arriba que muestra cuánto se scrolleó la página. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 })
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[#E52B2B] via-white to-[#0038A8]"
      style={{ scaleX }}
    />
  )
}
