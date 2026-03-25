import { NextResponse } from 'next/server'

// Temporary diagnostic endpoint — shows DB connection status
// Remove after admin panel is working
export const dynamic = 'force-dynamic'

export async function GET() {
  const info: Record<string, unknown> = {
    node_version: process.version,
    node_env: process.env.NODE_ENV,
    has_database_url: !!process.env.DATABASE_URL,
    has_postgres_url: !!process.env.POSTGRES_URL,
    has_postgres_prisma_url: !!process.env.POSTGRES_PRISMA_URL,
    has_payload_secret: !!process.env.PAYLOAD_SECRET,
    has_next_public_server_url: !!process.env.NEXT_PUBLIC_SERVER_URL,
    tls_reject: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
    // Show first 30 chars of connection string (safe — no password visible)
    db_url_prefix: (process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || '')
      .replace(/:([^@]+)@/, ':***@')
      .substring(0, 60),
  }

  // Try actual DB connection
  try {
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    })
    const client = await pool.connect()
    const result = await client.query('SELECT version()')
    client.release()
    await pool.end()
    info.db_status = 'connected'
    info.db_version = result.rows[0]?.version?.substring(0, 50)
  } catch (err: unknown) {
    info.db_status = 'failed'
    info.db_error = err instanceof Error ? err.message : String(err)
    info.db_error_code = err instanceof Error && 'code' in err ? (err as NodeJS.ErrnoException).code : undefined
  }

  return NextResponse.json(info)
}
