import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'anikai.to',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.anikai.to',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'asuracomic.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gg.asuracomic.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
