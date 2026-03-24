import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
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
