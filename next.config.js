/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_DOMAIN: 'ynnai.com',
  },
  // 配置图片域名白名单
  images: {
    domains: ['ynnai.com'],
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
  }
}

module.exports = nextConfig
