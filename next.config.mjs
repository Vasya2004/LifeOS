import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Use temp dir locally to avoid iCloud interference; use default .next on Vercel
  distDir: process.env.VERCEL ? '.next' : (process.platform === 'win32' ? 'C:/Temp/lifeos-next' : '/tmp/lifeos-next'),
}

export default withBundleAnalyzer(nextConfig)
