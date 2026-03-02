import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Política de cookies - DescubrePY",
  description: "Uso de cookies y tecnologías similares en DescubrePY.",
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/30 py-10 sm:py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
              Política de cookies
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString("es-PY", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed">
            <p className="text-muted-foreground">
              Esta página explica qué son las cookies, cuáles utilizamos en DescubrePY y cómo podés gestionarlas. Para el tratamiento de tus datos personales en general, consultá nuestra{" "}
              <Link href="/politica-de-privacidad" className="text-primary underline hover:no-underline">
                política de privacidad
              </Link>
              .
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">¿Qué son las cookies?</h2>
            <p className="text-muted-foreground">
              Las cookies son pequeños archivos de texto que el sitio web guarda en tu dispositivo (ordenador, tablet o móvil) cuando lo visitás. Permiten que la página recuerde acciones o preferencias durante un tiempo, para que no tengas que volver a configurarlas en cada visita.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">Cookies que utilizamos</h2>
            <p className="text-muted-foreground">
              En DescubrePY utilizamos cookies y tecnologías similares (por ejemplo, almacenamiento local del navegador) para:
            </p>
            <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Sesión y autenticación:</strong> mantener tu sesión iniciada mientras navegás (por ejemplo, para que no tengas que iniciar sesión en cada página). Esta información se guarda de forma local en tu navegador.</li>
              <li><strong>Preferencias:</strong> recordar opciones que hayas elegido para mejorar tu experiencia (cuando apliquemos esta funcionalidad).</li>
              <li><strong>Funcionamiento del sitio:</strong> garantizar el correcto funcionamiento de la plataforma y la seguridad de la sesión.</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              No utilizamos cookies de publicidad de terceros ni de seguimiento para fines de marketing en esta versión del sitio. Si en el futuro incorporáramos cookies de análisis o de terceros, lo indicaríamos aquí y, cuando la normativa lo requiera, pediríamos tu consentimiento.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">Almacenamiento local</h2>
            <p className="text-muted-foreground">
              Además de las cookies, podemos usar el almacenamiento local del navegador (localStorage) para guardar de forma temporal el estado de tu sesión (por ejemplo, que estés logueado). Estos datos solo se almacenan en tu dispositivo y no se envían a otros servidores más allá de los necesarios para el funcionamiento del sitio.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">Cómo gestionar las cookies</h2>
            <p className="text-muted-foreground">
              Podés configurar tu navegador para que bloquee o elimine cookies, o para que te avise antes de que se guarden. Los pasos dependen del navegador que uses (Chrome, Firefox, Safari, Edge, etc.); normalmente se encuentra en la sección de &quot;Privacidad&quot; o &quot;Seguridad&quot; de la configuración. Tené en cuenta que si desactivás las cookies necesarias para la sesión, es posible que no puedas iniciar sesión o que tengas que hacerlo en cada visita.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">Cambios</h2>
            <p className="text-muted-foreground">
              Podemos actualizar esta política de cookies si cambiamos las tecnologías que utilizamos. La versión vigente se publicará en esta página con la fecha de última actualización.
            </p>

            <h2 className="mt-8 text-lg font-semibold text-foreground">Contacto</h2>
            <p className="text-muted-foreground">
              Para consultas sobre el uso de cookies podés utilizar nuestra sección de{" "}
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
