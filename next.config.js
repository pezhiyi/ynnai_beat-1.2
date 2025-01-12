/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname)
    };
    return config;
  },
  swcMinify: false,
  onError: (err) => {
    console.error('Next.js Error:', err);
  },
  experimental: {
    appDir: false,
    serverComponents: false
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' }
        ],
      },
    ]
  }
}

module.exports = nextConfig
