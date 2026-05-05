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
  // Required for Payload CMS Postgres in serverless.
  // drizzle-kit is required at runtime by /api/schema-push (Payload's
  // pushDevSchema lazily imports `drizzle-kit/api`).
  serverExternalPackages: ['pg', 'pg-native', 'drizzle-kit', '@payloadcms/drizzle'],
  outputFileTracingIncludes: {
    '/api/schema-push': ['./node_modules/drizzle-kit/**/*'],
  },
}

export default withPayload(nextConfig)
