/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Don't write AGENTS.md / CLAUDE.md into the project when `next dev` runs under a coding agent.
  agentRules: false,

  images: {
    formats: ['image/webp'],
  },

  compiler: {
    // Strip console.log/info/debug from production bundles; keep errors and warnings.
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

export default nextConfig
