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
  experimental: {
    appDir: false,
    serverComponents: false
  }
}

module.exports = nextConfig
