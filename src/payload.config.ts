import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { payloadCloudPlugin } from '@payloadcms/plugin-cloud'

import { Services } from './payload/collections/Services'
import { Pages } from './payload/collections/Pages'
import { GeoPages } from './payload/collections/GeoPages'
import { Media } from './payload/collections/Media'
import { Testimonials } from './payload/collections/Testimonials'
import { FAQs } from './payload/collections/FAQs'
import { Tags } from './payload/collections/Tags'
import { Settings } from './payload/globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
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
    Services,
    Pages,
    GeoPages,
    Media,
    Testimonials,
    FAQs,
    Tags,
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
        group: 'Configuration',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
        },
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
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || `file:${path.resolve(dirname, '../database.db')}`,
    },
  }),
  secret: process.env.PAYLOAD_SECRET || 'capital-upfitters-cms-secret-change-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  upload: {
    limits: {
      fileSize: 10000000, // 10MB
    },
  },
  plugins: [
    // payloadCloudPlugin() — enable when deploying to Payload Cloud
  ],
})
