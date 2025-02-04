/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_ACTIONS || false;

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isGithubPages ? '/jlcpcb-library-tool' : '',
  assetPrefix: isGithubPages ? '/jlcpcb-library-tool/' : '',
};

module.exports = nextConfig;
