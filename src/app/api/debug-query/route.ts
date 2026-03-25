import { NextResponse } from 'next/server'
import pg from 'pg'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Show all available connection env vars (passwords masked)
  const mask = (s?: string) => s ? s.replace(/:([^@:]{3})[^@]*@/, ':***@').substring(0, 90) : 'NOT SET'

  const info: Record<string, unknown> = {
    DATABASE_URL: mask(process.env.DATABASE_URL),
    POSTGRES_URL: mask(process.env.POSTGRES_URL),
    POSTGRES_URL_NON_POOLING: mask(process.env.POSTGRES_URL_NON_POOLING),
    POSTGRES_PRISMA_URL: mask(process.env.POSTGRES_PRISMA_URL),
    SUPABASE_URL: mask(process.env.SUPABASE_URL),
  }

  // Try each available connection string
  const candidates = [
    ['DATABASE_URL', process.env.DATABASE_URL],
    ['POSTGRES_URL_NON_POOLING', process.env.POSTGRES_URL_NON_POOLING],
    ['POSTGRES_PRISMA_URL', process.env.POSTGRES_PRISMA_URL],
    ['POSTGRES_URL', process.env.POSTGRES_URL],
  ]

  for (const [name, cs] of candidates) {
    if (!cs) continue
    const client = new pg.Client({ connectionString: cs as string, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 })
    try {
      await client.connect()
      const tables = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`)
      info[`${name}_tables`] = tables.rows.map((r: {tablename: string}) => r.tablename)
      await client.end()
    } catch (err: unknown) {
      info[`${name}_error`] = err instanceof Error ? err.message : String(err)
      try { await client.end() } catch {}
    }
  }

  return NextResponse.json(info)
}
