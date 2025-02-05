/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NODE_ENV === 'production' ? '/jlcpcb-library-tool' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/jlcpcb-library-tool/' : '',
  publicRuntimeConfig: {
    basePath: process.env.NODE_ENV === 'production' ? '/jlcpcb-library-tool' : '',
  },
}

module.exports = nextConfig