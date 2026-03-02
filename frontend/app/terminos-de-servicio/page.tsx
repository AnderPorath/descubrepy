import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Términos de servicio - DescubrePY",
  description: "Términos y condiciones de uso de la plataforma DescubrePY.",
}

export default function TerminosDeServicioPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/30 py-10 sm:py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
              Términos de servicio
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString("es-PY", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed">
            <p className="text-muted-foreground">
              Bienvenido a DescubrePY. Al acceder o utilizar nuestra plataforma y servicios, aceptás estos términos de servicio. Si no estás de acuerdo con alguna parte, te pedimos que no utilices el sitio.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">1. Descripción del servicio</h2>
            <p className="text-muted-foreground">
              DescubrePY es una guía digital que permite a los usuarios descubrir negocios, servicios y establecimientos en Paraguay. La plataforma ofrece información publicada por administradores y permite a los usuarios registrados guardar favoritos y gestionar su perfil. Los negocios pueden ser registrados y editados por usuarios con rol de administrador.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">2. Uso aceptable</h2>
            <p className="text-muted-foreground">
              Te comprometés a utilizar DescubrePY únicamente de forma lícita y de manera que no perjudique el uso de otros usuarios ni el funcionamiento del servicio. No está permitido: usar la plataforma para fines fraudulentos o ilegales; publicar información falsa o engañosa sobre negocios; intentar acceder a cuentas o datos ajenos; alterar, interferir o sobrecargar los sistemas del sitio; ni utilizar bots o medios automatizados sin autorización.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">3. Cuentas y perfiles</h2>
            <p className="text-muted-foreground">
              Para acceder a ciertas funciones (por ejemplo, favoritos o registro de negocios como administrador) es necesario crear una cuenta. Sos responsable de mantener la confidencialidad de tu contraseña y de toda la actividad que se realice en tu cuenta. DescubrePY se reserva el derecho de suspender o eliminar cuentas que infrinjan estos términos.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">4. Contenido y datos de negocios</h2>
            <p className="text-muted-foreground">
              La información de los negocios (nombre, dirección, horarios, fotos, etc.) es proporcionada por los administradores o por DescubrePY. Nos esforzamos por mantener la información precisa, pero no garantizamos la exhaustividad ni la actualización permanente. Los usuarios pueden reportar errores o contenido inapropiado para que sea revisado.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">5. Propiedad intelectual</h2>
            <p className="text-muted-foreground">
              El diseño, la marca DescubrePY, los textos y los elementos de la plataforma son propiedad de DescubrePY o de sus licenciantes. Las imágenes y textos aportados por los negocios siguen siendo responsabilidad de quienes los publican; al subir contenido, otorgás una licencia para su uso en la plataforma.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">6. Limitación de responsabilidad</h2>
            <p className="text-muted-foreground">
              DescubrePY se ofrece &quot;tal cual&quot;. No nos hacemos responsables de daños indirectos, pérdida de datos o perjuicios derivados del uso o la imposibilidad de usar el servicio. La relación comercial o de consumo entre el usuario y los negocios listados es exclusiva entre ellos; DescubrePY actúa únicamente como directorio informativo.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">7. Modificaciones</h2>
            <p className="text-muted-foreground">
              Podemos actualizar estos términos en cualquier momento. Los cambios entrarán en vigor al publicarse en esta página, indicando la fecha de última actualización. El uso continuado del sitio después de los cambios implica la aceptación de los nuevos términos.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">8. Contacto</h2>
            <p className="text-muted-foreground">
              Para consultas sobre estos términos podés utilizar la sección de{" "}
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
