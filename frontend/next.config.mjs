/** @type {import('next').NextConfig} */
const nextConfig = {
    // This is needed for the Dockerfile `npm run build` to work correctly with `output: 'standalone'`
    output: 'standalone',
    async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'http://letta-server:8283/v1/:path*', // Proxy to Backend
          },
        ]
      },
};

export default nextConfig;
