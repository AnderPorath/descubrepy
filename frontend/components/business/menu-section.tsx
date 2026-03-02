import type { BusinessDetailApi } from "@/lib/api"

export function MenuSection({ business }: { business: BusinessDetailApi }) {
  const text = business.menu_services?.trim()

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground">Más información</h2>
      {text ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {text}
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-border bg-card p-4 text-sm italic text-muted-foreground">Sin información adicional.</p>
      )}
    </div>
  )
}
