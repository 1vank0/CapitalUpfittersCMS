import { NextResponse } from 'next/server'
import pg from 'pg'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use the connection string passed as param, or fall back to env vars
  const customCs = searchParams.get('cs')
  // Never use DATABASE_URL — Vercel cannot resolve direct Supabase DNS
  const connectionString =
    customCs ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL

  const results: string[] = []
  results.push('Using: ' + connectionString?.replace(/:([^@]+)@/, ':***@').substring(0, 80))

  // Run raw SQL migration to create all Payload tables
  const client = new pg.Client({
    connectionString: connectionString!,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  })

  try {
    await client.connect()
    results.push('Connected to database')

    // Check current tables
    const existing = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
    )
    results.push(`Existing tables: ${existing.rows.length === 0 ? 'none' : existing.rows.map((r: {tablename: string}) => r.tablename).join(', ')}`)

    // Initialize Payload to run its migrations
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    const payload = await getPayload({ config })
    results.push('Payload initialized')

    await payload.db.migrate()
    results.push('payload.db.migrate() completed')

    // Verify tables were created
    const after = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
    )
    results.push(`Tables after migration: ${after.rows.map((r: {tablename: string}) => r.tablename).join(', ')}`)

    await client.end()
    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    results.push('ERROR: ' + message.substring(0, 300))
    try { await client.end() } catch {}
    return NextResponse.json({ success: false, results, error: message }, { status: 500 })
  }
}
