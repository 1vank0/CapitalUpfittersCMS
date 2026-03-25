import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { Services } from './payload/collections/Services'
import { Pages } from './payload/collections/Pages'
import { GeoPages } from './payload/collections/GeoPages'
import { Media } from './payload/collections/Media'
import { Testimonials } from './payload/collections/Testimonials'
import { FAQs } from './payload/collections/FAQs'
import { Tags } from './payload/collections/Tags'
import { Leads } from './payload/collections/Leads'
import { Quotes } from './payload/collections/Quotes'
import { Settings } from './payload/globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, '..'),
      autoGenerate: false,
    },
    meta: {
      titleSuffix: '— Capital Upfitters CMS',
      favicon: '/favicon.ico',
    },
    user: 'users',
    autoLogin:
      process.env.NODE_ENV === 'development'
        ? {
            email: 'admin@capitalupfitters.com',
            password: 'admin',
          }
        : false,
  },
  collections: [
    // ─── Content ───────────────────────────────────────────
    Services,
    Pages,
    GeoPages,
    Media,
    Testimonials,
    FAQs,
    Tags,
    // ─── Operations ────────────────────────────────────────
    Leads,
    Quotes,
    // ─── System ────────────────────────────────────────────
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
        group: 'Configuration',
      },
      fields: [
        { name: 'name', type: 'text' },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Editor', value: 'editor' },
          ],
          defaultValue: 'editor',
        },
      ],
    },
  ],
  globals: [Settings],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      // POSTGRES_URL_NON_POOLING = direct connection required for Payload's prepared statements
      // pgbouncer transaction pooling (POSTGRES_URL port 6543) rejects prepared statements
      // Use pooler URLs only — Vercel cannot reach Supabase direct connection (IPv6 DNS)
      // POSTGRES_URL_NON_POOLING is session mode pooler (port 5432) — supports complex queries
      connectionString:
        process.env.POSTGRES_URL_NON_POOLING ||
        process.env.POSTGRES_PRISMA_URL ||
        process.env.POSTGRES_URL,
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      ssl: { rejectUnauthorized: false },
      application_name: 'capital-upfitters-cms',
    },

  }),
  secret: process.env.PAYLOAD_SECRET || 'capital-upfitters-cms-secret-change-in-production',
  cors: [
    'https://capitalupfitters.com',
    'https://www.capitalupfitters.com',
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
  csrf: [
    'https://capitalupfitters.com',
    'https://www.capitalupfitters.com',
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  upload: {
    limits: {
      fileSize: 10000000,
    },
  },
  plugins: [],
})
