/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    const backendUrl = isProd
      ? process.env.NEXT_PUBLIC_API_URL || 'https://easybraille-backend.up.railway.app'
      : 'http://localhost:5000';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
