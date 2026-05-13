import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-router-dom': path.resolve(process.cwd(), 'src/lib/next-router-compat.tsx'),
    };
    return config;
  },
  async redirects() {
    return [
      { source: '/generator', destination: '/generate', permanent: false },
      { source: '/history', destination: '/contents', permanent: false },
      { source: '/subscription', destination: '/billing', permanent: false },
      { source: '/fine-tuning', destination: '/fine-tune', permanent: false },
      { source: '/api-keys', destination: '/dashboard', permanent: false },
      { source: '/admin/analytics', destination: '/admin', permanent: false },
      { source: '/admin/fine-tuning', destination: '/admin/models', permanent: false },
      { source: '/admin/api', destination: '/admin/settings', permanent: false },
    ];
  },
};

export default nextConfig;
