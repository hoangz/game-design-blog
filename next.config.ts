import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  // Required for Sanity Studio embedded in Next.js
  transpilePackages: ['next-sanity'],
}

export default nextConfig
