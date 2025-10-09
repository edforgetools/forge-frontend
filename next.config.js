/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/forge/:path*', destination: 'https://forge-layer.onrender.com/forge/:path*' },
      { source: '/api/health', destination: 'https://forge-layer.onrender.com/health' }
    ];
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true }
};
module.exports = nextConfig;
