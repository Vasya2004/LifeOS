/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Use /tmp locally to avoid iCloud interference; use default .next on Vercel
  distDir: process.env.VERCEL ? '.next' : '/tmp/lifeos-next',
}

export default nextConfig
