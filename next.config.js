/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // distDir: 'dist',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/random',
      },
    ],
  },
};

module.exports = nextConfig;
