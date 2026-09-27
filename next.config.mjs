/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // AVIF first (smallest), WebP fallback; originals only for old browsers
    formats: ['image/avif', 'image/webp'],
    qualities: [75],
    minimumCacheTTL: 2678400, // 31 days — /public images rarely change
  },
}

export default nextConfig
