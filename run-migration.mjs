/**
 * Standalone migration runner — runs from local machine against Supabase pooler
 * Usage: DATABASE_URL="postgres://..." node run-migration.mjs
 */

import pg from 'pg'
const { Client } = pg

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING

if (!connectionString) {
  console.error('ERROR: Set DATABASE_URL or POSTGRES_URL_NON_POOLING')
  process.exit(1)
}

console.log('Connecting to:', connectionString.replace(/:([^@]+)@/, ':***@').substring(0, 80))

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
})

await client.connect()
console.log('Connected!')

// Check current tables
const before = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`)
console.log('Tables before:', before.rows.length ? before.rows.map(r => r.tablename).join(', ') : 'none')

await client.end()
console.log('Done. Now run migrations via: node node_modules/payload/bin.js migrate')
