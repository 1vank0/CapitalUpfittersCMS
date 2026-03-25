import { NextResponse } from 'next/server'
import pg from 'pg'

export const dynamic = 'force-dynamic'

export async function GET() {
  const connectionString = process.env.POSTGRES_URL

  const info: Record<string, unknown> = {
    cs_preview: connectionString?.replace(/:([^@]+)@/, ':***@').substring(0, 90),
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  })

  try {
    await client.connect()
    info.connected = true

    // List ALL tables across all schemas
    const allTables = await client.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
    `)
    info.all_tables = allTables.rows

    // Try creating users table manually as a test
    try {
      await client.query(`SELECT 1 FROM users LIMIT 1`)
      info.users_table = 'EXISTS'
    } catch (e: unknown) {
      info.users_table = e instanceof Error ? e.message : String(e)
    }

    // Check search_path
    const sp = await client.query('SHOW search_path')
    info.search_path = sp.rows[0]

    // Check current database and user
    const dbInfo = await client.query('SELECT current_database(), current_user, current_schema()')
    info.db_info = dbInfo.rows[0]

    await client.end()
  } catch (err: unknown) {
    info.error = err instanceof Error ? err.message : String(err)
    try { await client.end() } catch {}
  }

  return NextResponse.json(info)
}
