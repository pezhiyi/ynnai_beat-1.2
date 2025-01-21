/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
    level: 'debug',
  },
  onDemandEntries: {
    // 页面保持活跃状态的时间
    maxInactiveAge: 25 * 1000,
    // 同时保持活跃的页面数
    pagesBufferLength: 2,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 在开发环境启用详细日志
      config.infrastructureLogging = {
        level: 'verbose',
        debug: true
      }
    }
    return config
  },
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    },
  }
}

module.exports = nextConfig
