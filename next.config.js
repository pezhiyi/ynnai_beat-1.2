/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  env: {
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN || 'ynnai.com',
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || 'production',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'https://ynnai.com'
  },
  // 配置图片域名白名单
  images: {
    domains: ['ynnai.com', 'test.ynnai.com', 'localhost', 'ynnai-beat-1-2-3n8p.vercel.app'],
  },
  // 生产环境配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ],
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname),
      '@components': path.join(__dirname, 'components'),
      '@pages': path.join(__dirname, 'pages'),
      '@styles': path.join(__dirname, 'styles'),
      '@config': path.join(__dirname, 'config')
    };
    return config;
  }
}

module.exports = nextConfig
