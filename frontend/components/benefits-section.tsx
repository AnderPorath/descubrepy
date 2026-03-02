import { Eye, Zap, TrendingUp, CheckCircle2, Shield, Clock, LucideIcon } from "lucide-react"

const benefits: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Eye, title: "Visibilidad garantizada", description: "Tu negocio será visto por miles de personas que buscan activamente servicios como el tuyo." },
  { icon: Zap, title: "Publicación rápida", description: "En menos de 24 horas tu negocio estará publicado y visible en nuestra plataforma." },
  { icon: TrendingUp, title: "Llegá a más clientes en Paraguay", description: "Tu negocio visible para quienes buscan servicios como el tuyo en todo el país. Más alcance, más consultas, más ventas." },
  { icon: CheckCircle2, title: "Perfil completo", description: "Fotos, horarios, redes sociales, WhatsApp directo y toda la información de tu negocio." },
  { icon: Shield, title: "Confianza y respaldo", description: "Formá parte de la plataforma líder de directorio de negocios en Paraguay." },
  { icon: Clock, title: "Soporte 24/7", description: "Nuestro equipo está disponible para ayudarte en todo momento con tu publicación." },
]

export function BenefitsSection() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
          Beneficios
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Por qué anunciarse con nosotros
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed">
          DescubrePY es la plataforma líder de directorio de negocios en Paraguay. Estos son algunos beneficios de formar parte.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {benefits.map((benefit) => {
          const Icon = benefit.icon
          return (
            <div
              key={benefit.title}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">{benefit.title}</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
