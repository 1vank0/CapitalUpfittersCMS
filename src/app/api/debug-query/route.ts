import { NextResponse } from 'next/server'
import pg from 'pg'

export const dynamic = 'force-dynamic'

export async function GET() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL

  const info: Record<string, unknown> = {
    using: connectionString
      ?.replace(/:([^@]+)@/, ':***@')
      .substring(0, 80),
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    info.connected = true

    // Check which tables exist
    const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `)
    info.tables = tables.rows.map((r: { tablename: string }) => r.tablename)

    // Try the exact failing query
    try {
      const result = await client.query(`
        SELECT "users"."id", "users"."email"
        FROM "users" "users"
        ORDER BY "users"."created_at" DESC
        LIMIT 1
      `)
      info.users_query = 'ok'
      info.user_count = result.rowCount
    } catch (qErr: unknown) {
      info.users_query_error = qErr instanceof Error ? qErr.message : String(qErr)
    }

    // Try the lateral join specifically
    try {
      const result = await client.query(`
        SELECT "users"."id"
        FROM "users" "users"
        LEFT JOIN LATERAL (
          SELECT 1 as data FROM "users_sessions" "us"
          WHERE "us"."_parent_id" = "users"."id"
          LIMIT 1
        ) "users_sessions" ON true
        LIMIT 1
      `)
      info.lateral_join = 'ok'
    } catch (lErr: unknown) {
      info.lateral_join_error = lErr instanceof Error ? lErr.message : String(lErr)
    }

    await client.end()
  } catch (err: unknown) {
    info.connect_error = err instanceof Error ? err.message : String(err)
    try { await client.end() } catch {}
  }

  return NextResponse.json(info)
}
