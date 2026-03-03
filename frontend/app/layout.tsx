import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: 'DescubrePY - Tu Guia Digital de Paraguay',
  description: 'Descubre los mejores lugares de Paraguay. Restaurantes, bares, gimnasios, tiendas, eventos y servicios en tu ciudad.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#002868',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${_inter.variable} ${_playfair.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
