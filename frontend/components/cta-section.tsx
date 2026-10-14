"use client"

import Link from "next/link"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react"
import { ArrowRight, Building2, MapPin, Star, Tag, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Magnetic, Reveal } from "@/components/motion/primitives"

const FLOATING = [
  { icon: Star, className: "left-[8%] top-[18%]", delay: 0 },
  { icon: MapPin, className: "right-[10%] top-[22%]", delay: 0.6 },
  { icon: Tag, className: "left-[14%] bottom-[16%]", delay: 1.2 },
  { icon: TrendingUp, className: "right-[14%] bottom-[18%]", delay: 1.8 },
]

export function CtaSection() {
  const reduce = useReducedMotion()
  const mx = useMotionValue(50)
  const my = useMotionValue(50)
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${mx}% ${my}%, rgba(255,255,255,0.14), transparent 60%)`

  return (
    <section id="publicar" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal y={40}>
          <div
            className="group relative overflow-hidden rounded-3xl bg-primary"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              mx.set(((e.clientX - r.left) / r.width) * 100)
              my.set(((e.clientY - r.top) / r.height) * 100)
            }}
          >
            <motion.div
              aria-hidden
              className="absolute -inset-1/2 opacity-60"
              style={{
                background:
                  "conic-gradient(from 0deg at 50% 50%, rgba(229,43,43,0.35), transparent 25%, rgba(0,56,168,0.55), transparent 60%, rgba(251,191,36,0.25), transparent 85%)",
              }}
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            <motion.div aria-hidden className="absolute inset-0" style={{ background: spotlight }} />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]"
            />

            {FLOATING.map(({ icon: Icon, className, delay }) => (
              <motion.div
                key={className}
                aria-hidden
                className={`absolute hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md md:flex ${className}`}
                animate={reduce ? undefined : { y: [0, -14, 0], rotate: [0, 6, -4, 0] }}
                transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon className="h-5 w-5 text-white/80" />
              </motion.div>
            ))}

            <div className="relative flex flex-col items-center gap-8 px-6 py-16 text-center md:px-16 lg:py-20">
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10 ring-1 ring-white/20"
                whileHover={{ rotate: 12, scale: 1.1 }}
                animate={reduce ? undefined : { boxShadow: ["0 0 0 0 rgba(255,255,255,0.25)", "0 0 0 18px rgba(255,255,255,0)"] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              >
                <Building2 className="h-7 w-7 text-primary-foreground" />
              </motion.div>

              <div>
                <h2 className="text-balance font-[family-name:var(--font-heading)] text-3xl font-bold text-primary-foreground md:text-5xl">
                  Publicá tu negocio{" "}
                  <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                    hoy
                  </span>
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-primary-foreground/80">
                  Llegá a miles de usuarios que buscan negocios como el tuyo en Paraguay.
                  Registrate y empezá a recibir clientes.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Magnetic>
                  <Button asChild size="lg" className="group/cta relative cursor-pointer gap-2 overflow-hidden bg-accent text-accent-foreground shadow-lg shadow-black/20 hover:bg-accent/90">
                    <Link href="/contacto">
                      <span
                        aria-hidden
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/cta:translate-x-full"
                      />
                      Comenzar hoy
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                    </Link>
                  </Button>
                </Magnetic>
                <Magnetic>
                  <Button asChild variant="outline" size="lg" className="cursor-pointer border-primary-foreground/20 bg-white/5 text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <Link href="/contacto">Conocer más</Link>
                  </Button>
                </Magnetic>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
