/** @type {import('next').NextConfig} */
const backendBase = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  'http://127.0.0.1:6000'
).replace(/\/$/, '')

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    proxyClientMaxBodySize: 10 * 1024 * 1024, // 10 MB
    serverActions: { bodySizeLimit: "10mb" },
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendBase}/uploads/:path*`,
      },
    ]
  },
}

export default nextConfig
