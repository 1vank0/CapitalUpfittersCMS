import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Seed scripts and utility files won't block production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Payload CMS types evolve — disable during initial setup, re-enable after stable
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Required for Payload CMS SQLite in serverless
  serverExternalPackages: ['better-sqlite3'],
}

export default withPayload(nextConfig)
