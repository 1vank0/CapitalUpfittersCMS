import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  const info: Record<string, unknown> = {
    node_version: process.version,
    node_env: process.env.NODE_ENV,
    has_database_url: !!process.env.DATABASE_URL,
    has_payload_secret: !!process.env.PAYLOAD_SECRET,
    has_next_public_server_url: !!process.env.NEXT_PUBLIC_SERVER_URL,
    db_url_prefix: (process.env.DATABASE_URL || '')
      .replace(/:([^@]+)@/, ':***@')
      .substring(0, 60),
  }

  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json(info)
  }

  // Full diagnostic with Payload
  try {
    const payload = await getPayload({ config })
    const db = payload.db as any
    const drizzle = db.drizzle

    // Check table existence and structure
    const tables: Record<string, unknown> = {}
    for (const table of ['users', 'users_sessions', 'payload_preferences', 'payload_migrations']) {
      try {
        const r = await drizzle.execute(`SELECT COUNT(*) as cnt FROM "${table}"`)
        tables[table] = `${r.rows?.[0]?.cnt} rows`
      } catch (e: unknown) {
        tables[table] = `ERROR: ${String(e).substring(0, 100)}`
      }
    }
    info.tables = tables

    // Check users_sessions columns
    try {
      const cols = await drizzle.execute(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users_sessions' 
        ORDER BY ordinal_position
      `)
      info.users_sessions_columns = cols.rows
    } catch (e: unknown) {
      info.users_sessions_columns = `ERROR: ${String(e).substring(0, 100)}`
    }

    // Check users columns
    try {
      const cols = await drizzle.execute(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `)
      info.users_columns = cols.rows
    } catch (e: unknown) {
      info.users_columns = `ERROR: ${String(e).substring(0, 100)}`
    }

    // Try Payload's own user lookup (what SSR auth does)
    try {
      const users = await payload.find({ collection: 'users', limit: 1, overrideAccess: true })
      info.payload_users = `${users.totalDocs} total, first: ${users.docs[0]?.email ?? 'none'}`
    } catch (e: unknown) {
      info.payload_users = `ERROR: ${String(e).substring(0, 200)}`
    }

    info.db_status = 'connected'
  } catch (err: unknown) {
    info.db_status = 'failed'
    info.db_error = err instanceof Error ? err.message.substring(0, 300) : String(err)
  }

  return NextResponse.json(info)
}
