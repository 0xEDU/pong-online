/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/ws',
        destination: 'http://localhost:3001/ws',
      },
    ];
  },
};

module.exports = nextConfig;
