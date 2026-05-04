import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'

// ─── Content collections ──────────────────────────────────
import { Services } from './payload/collections/Services'
import { Pages } from './payload/collections/Pages'
import { GeoPages } from './payload/collections/GeoPages'
import { Media } from './payload/collections/Media'
import { Testimonials } from './payload/collections/Testimonials'
import { FAQs } from './payload/collections/FAQs'
import { Tags } from './payload/collections/Tags'
import { ContentBlocks } from './payload/collections/ContentBlocks'

// ─── Operations collections ───────────────────────────────
import { Leads } from './payload/collections/Leads'
import { Quotes } from './payload/collections/Quotes'
import { AccountRequests } from './payload/collections/AccountRequests'

// ─── System collections ───────────────────────────────────
import { Organizations } from './payload/collections/Organizations'
import { OrgMemberships } from './payload/collections/OrgMemberships'
import { Users } from './payload/collections/Users'

// ─── Globals ──────────────────────────────────────────────
import { Settings } from './payload/globals/Settings'
import { AIProfile } from './payload/globals/AIProfile'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'https://capital-upfitters-cms.vercel.app',
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, '..'),
      autoGenerate: false,
    },
    meta: {
      titleSuffix: '— Upfit Portal',
      icons: [{ rel: 'icon', url: '/favicon.ico' }],
      openGraph: { images: [{ url: '/og-image.jpg' }] },
      description: 'Upfit Portal — operational control center for upfitting businesses.',
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
    Pages,
    Services,
    GeoPages,
    Media,
    ContentBlocks,
    Testimonials,
    FAQs,
    Tags,
    // ─── Operations ────────────────────────────────────────
    Leads,
    Quotes,
    AccountRequests,
    // ─── System ────────────────────────────────────────────
    Organizations,
    OrgMemberships,
    Users,
  ],
  globals: [Settings, AIProfile],
  editor: lexicalEditor(),
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    },
  }),
  secret: process.env.PAYLOAD_SECRET || 'capital-upfitters-cms-secret-change-in-production',
  cors: [
    'https://capitalupfitters.com',
    'https://www.capitalupfitters.com',
    'https://capital-upfitters-d2y6.vercel.app',
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
  csrf: [],
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
