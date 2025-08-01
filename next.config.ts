import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['sprint-fe-project.s3.ap-northeast-2.amazonaws.com'],
  },
  eslint: {
    // ✅ ESLint 오류 무시하고 빌드 강행
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
