"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { CategoryIcon } from "@/components/category-icon"
import { Stagger, StaggerItem, TiltCard } from "@/components/motion/primitives"
import { getCategoryEmoji } from "@/lib/category-emojis"

type Category = {
  id: number
  slug: string
  title: string
}

export function CategoriesMarquee({ categories }: { categories: Category[] }) {
  const items = [...categories, ...categories]
  return (
    <div className="relative -mx-4 overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] lg:-mx-8">
      <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-3 hover:[animation-play-state:paused]">
        {items.map((c, i) => (
          <Link
            key={`${c.id}-${i}`}
            href={`/categorias/${c.slug}?from=inicio`}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 shadow-sm transition hover:border-primary/30 hover:text-primary"
          >
            <span className="text-base leading-none transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125">
              {getCategoryEmoji(c.slug)}
            </span>
            {c.title}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function CategoriesGrid({ categories }: { categories: Category[] }) {
  return (
    <Stagger
      className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-3 lg:mt-12 lg:grid-cols-6 lg:gap-5"
      stagger={0.05}
    >
      {categories.map((category) => (
        <StaggerItem key={category.id}>
          <TiltCard max={10} className="rounded-[20px]">
            <Link
              href={`/categorias/${category.slug}?from=inicio`}
              className="group relative flex h-full min-h-[100px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] border border-[#e5e7eb] bg-white p-4 text-center shadow-sm transition-shadow duration-300 hover:shadow-[0_18px_40px_-12px_rgba(0,40,104,0.25)] sm:min-h-[140px] sm:gap-4 sm:p-5 md:min-h-[100px] md:p-4 lg:min-h-[140px] lg:p-5"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#E52B2B] via-amber-300 to-[#0038A8] transition-transform duration-500 group-hover:scale-x-100"
              />
              <motion.span
                className="[transform:translateZ(30px)]"
                whileHover={{ rotate: [0, -10, 10, -4, 0] }}
                transition={{ duration: 0.6 }}
              >
                <CategoryIcon
                  categorySlug={category.slug}
                  size="default"
                  className="transition-colors duration-300 group-hover:from-primary/30 group-hover:to-primary/10 sm:scale-110"
                />
              </motion.span>
              <h3 className="text-sm font-semibold text-[#111827] [transform:translateZ(20px)] sm:text-base lg:text-lg">
                {category.title}
              </h3>
            </Link>
          </TiltCard>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
