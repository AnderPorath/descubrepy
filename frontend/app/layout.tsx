import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.descubrepy.com.py'),
  title: 'DescubrePY - Tu Guia Digital de Paraguay',
  description: 'Descubre los mejores lugares de Paraguay. Restaurantes, bares, gimnasios, tiendas, eventos y servicios en tu ciudad.',
  generator: 'v0.app',
  openGraph: {
    type: 'website',
    locale: 'es_PY',
    siteName: 'DescubrePY',
    title: 'DescubrePY - Tu Guia Digital de Paraguay',
    description: 'Descubre los mejores lugares de Paraguay. Restaurantes, bares, gimnasios, tiendas, eventos y servicios en tu ciudad.',
    images: [
      {
        url: '/images/logo-v303.png',
        width: 1200,
        height: 630,
        alt: 'DescubrePY',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DescubrePY - Tu Guia Digital de Paraguay',
    description: 'Descubre los mejores lugares de Paraguay. Restaurantes, bares, gimnasios, tiendas, eventos y servicios en tu ciudad.',
    images: ['/images/logo-v303.png'],
  },
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
      <head>
        <meta name="impact-site-verification" content="59c30482-792d-4fed-9282-98ceafbfcc93" />
      </head>
      <body className={`${_inter.variable} ${_playfair.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
