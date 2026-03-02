import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Política de privacidad - DescubrePY",
  description: "Política de privacidad y tratamiento de datos personales en DescubrePY.",
}

export default function PoliticaDePrivacidadPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/30 py-10 sm:py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
              Política de privacidad
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString("es-PY", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed">
            <p className="text-muted-foreground">
              En DescubrePY nos comprometemos a proteger tu privacidad. Esta política describe qué datos recopilamos, cómo los usamos y qué opciones tenés respecto a tu información.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">1. Datos que recopilamos</h2>
            <p className="text-muted-foreground">
              Cuando te registrás, recopilamos tu nombre, correo electrónico y una contraseña (almacenada de forma segura mediante hash). Si utilizás la función de favoritos, guardamos la asociación entre tu cuenta y los negocios que marcás. Los administradores que registran negocios pueden subir imágenes, textos, horarios y datos de contacto de los establecimientos; esos datos se almacenan para mostrarlos en la plataforma.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">2. Uso de la información</h2>
            <p className="text-muted-foreground">
              Utilizamos tus datos para: permitir el acceso a tu cuenta y la gestión de tu perfil; mostrar y gestionar tus favoritos; en el caso de administradores, publicar y editar la información de los negocios; mejorar el servicio y la experiencia de uso; y, si corresponde, responder consultas o comunicaciones que nos envíes. No vendemos tu información personal a terceros.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">3. Almacenamiento y seguridad</h2>
            <p className="text-muted-foreground">
              Los datos se almacenan en servidores que aplican medidas técnicas para proteger la información. Las contraseñas se guardan usando algoritmos de hash (por ejemplo, bcrypt) y no se almacenan en texto plano. Aun así, ningún sistema es infalible; te recomendamos usar una contraseña fuerte y no compartirla.
            </p>

            <h2 id="cookies" className="mt-8 text-lg font-semibold text-foreground">4. Cookies y tecnologías similares</h2>
            <p className="text-muted-foreground">
              Podemos utilizar cookies o almacenamiento local (por ejemplo, para mantener tu sesión iniciada o recordar preferencias). Podés configurar tu navegador para limitar o bloquear cookies; tené en cuenta que algunas funciones del sitio podrían dejar de estar disponibles.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">5. Tus derechos</h2>
            <p className="text-muted-foreground">
              Podés acceder a tu perfil en cualquier momento para ver, corregir o actualizar tu nombre y contraseña. Si querés eliminar tu cuenta o ejercer otros derechos sobre tus datos personales, podés contactarnos a través de la sección de contacto. Respetamos las disposiciones aplicables en Paraguay en materia de protección de datos personales.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">6. Menores</h2>
            <p className="text-muted-foreground">
              El servicio no está dirigido a menores de edad. No recopilamos intencionalmente datos de menores; si tomamos conocimiento de que se han proporcionado datos de un menor, actuaremos para eliminar esa información.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">7. Cambios en esta política</h2>
            <p className="text-muted-foreground">
              Podemos actualizar esta política de privacidad ocasionalmente. La versión vigente se publicará en esta página con la fecha de última actualización. Te recomendamos revisarla de vez en cuando.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">8. Contacto</h2>
            <p className="text-muted-foreground">
              Para consultas sobre privacidad o tratamiento de datos, podés utilizar nuestra sección de{" "}
              <Link href="/contacto" className="text-primary underline hover:no-underline">
                contacto
              </Link>
              .
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
