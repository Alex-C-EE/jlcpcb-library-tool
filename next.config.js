/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true,
    },
    basePath: '/jlcpcb-filter-tool',  // Should match your repository name
  }
  
  module.exports = nextConfig