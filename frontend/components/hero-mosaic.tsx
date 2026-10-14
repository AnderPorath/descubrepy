"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { fetchFeatured, getImageUrl } from "@/lib/api"
import { cn } from "@/lib/utils"

const FALLBACK_BG = "/images/hero-inicio-v8.jpg"
const COLUMNS = 12
const MIN_PER_COLUMN = 8

/** Duración (s) y sentido de cada columna: alternan para dar profundidad. */
const COLUMN_MOTION = [
  { duration: 70, dir: "up" },
  { duration: 54, dir: "down" },
  { duration: 82, dir: "up" },
  { duration: 60, dir: "down" },
  { duration: 76, dir: "up" },
  { duration: 50, dir: "down" },
  { duration: 66, dir: "up" },
  { duration: 58, dir: "down" },
  { duration: 80, dir: "up" },
  { duration: 52, dir: "down" },
  { duration: 72, dir: "up" },
  { duration: 62, dir: "down" },
] as const

function buildColumns(urls: string[]): string[][] {
  if (urls.length === 0) return []
  const needed = COLUMNS * MIN_PER_COLUMN
  const pool: string[] = []
  while (pool.length < needed) pool.push(...urls)
  const cols: string[][] = Array.from({ length: COLUMNS }, () => [])
  pool.slice(0, Math.max(needed, urls.length)).forEach((u, i) => {
    cols[i % COLUMNS].push(u)
  })
  // Rota cada columna para que la misma foto no quede alineada en filas vecinas
  return cols.map((col, i) => {
    const shift = (i * 3) % col.length
    return [...col.slice(shift), ...col.slice(0, shift)]
  })
}

function Tile({ src, accent }: { src: string; accent: boolean }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <div className="pb-2.5 sm:pb-3">
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-xl ring-1",
          accent ? "bg-white ring-white/30" : "bg-white/5 ring-white/10",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover",
            accent ? "opacity-95" : "opacity-50 grayscale",
          )}
        />
      </div>
    </div>
  )
}

export function HeroMosaic() {
  const [urls, setUrls] = useState<string[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchFeatured().then((list) => {
      if (cancelled) return
      const found = (Array.isArray(list) ? list : [])
        .map((b) => getImageUrl(b.image_url))
        .filter((u): u is string => Boolean(u))
      setUrls(Array.from(new Set(found)).slice(0, 30))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const columns = useMemo(() => buildColumns(urls ?? []), [urls])
  const showFallback = urls !== null && columns.length === 0

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#071233]">
      {showFallback ? (
        <Image
          src={FALLBACK_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          unoptimized
          className="object-cover object-[center_35%] sm:object-center"
        />
      ) : null}

      {columns.length > 0 ? (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 flex h-[180%] -translate-x-1/2 -translate-y-1/2 -rotate-[12deg] justify-center gap-2.5 sm:gap-3"
        >
          {columns.map((col, i) => {
            const { duration, dir } = COLUMN_MOTION[i]
            return (
              <div key={i} className="w-[84px] shrink-0 sm:w-[104px] lg:w-[120px]">
                <div
                  className="flex flex-col will-change-transform"
                  style={{
                    animation: `${dir === "up" ? "mosaic-up" : "mosaic-down"} ${duration}s linear infinite`,
                  }}
                >
                  {/* Contenido duplicado para que el loop sea continuo */}
                  {[...col, ...col].map((src, j) => (
                    <Tile key={`${src}-${j}`} src={src} accent={(i * 5 + (j % col.length) * 3) % 11 === 0} />
                  ))}
                </div>
              </div>
            )
          })}
        </motion.div>
      ) : null}

      {/* Capas para que el texto se lea: viñeta + tono de marca */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_45%,rgba(7,18,51,0.82),rgba(7,18,51,0.55)_70%,rgba(7,18,51,0.85))]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#071233]/60 via-transparent to-[#071233]/30" />
    </div>
  )
}
