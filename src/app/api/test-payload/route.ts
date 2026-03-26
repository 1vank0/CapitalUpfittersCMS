import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    results.push('1. Initializing Payload...')
    const payload = await getPayload({ config })
    results.push('2. Payload initialized OK')

    const db = payload.db as any
    const drizzle = db.drizzle

    // Dump exact schema table names
    if (db.schema) {
      const tableNames = Object.keys(db.schema)
      results.push(`Schema tables (${tableNames.length}): ${tableNames.join(', ')}`)
    }

    // Test all collections with FULL error messages
    for (const slug of ['users', 'services', 'leads', 'account-requests', 'media', 'pages', 'geo-pages', 'testimonials', 'faqs', 'tags', 'quotes']) {
      try {
        const r = await payload.find({ collection: slug as any, limit: 1, overrideAccess: true })
        results.push(`  ✅ ${slug}: OK (${r.totalDocs} docs)`)
      } catch (e: unknown) {
        // Get full error
        const msg = e instanceof Error ? e.message : String(e)
        const cause = (e as any)?.cause ? String((e as any).cause) : null
        results.push(`  ❌ ${slug}: ${msg.substring(0, 500)}`)
        if (cause) results.push(`     CAUSE: ${cause.substring(0, 300)}`)
      }
    }

    // Test globals
    try {
      await payload.findGlobal({ slug: 'settings', overrideAccess: true })
      results.push('  ✅ settings global: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      const cause = (e as any)?.cause ? String((e as any).cause) : null
      results.push(`  ❌ settings global: ${msg.substring(0, 500)}`)
      if (cause) results.push(`     CAUSE: ${cause.substring(0, 300)}`)
    }

    // Show actual DB columns for problematic tables
    for (const table of ['services', 'testimonials', 'faqs', 'quotes', 'settings']) {
      try {
        const cols = await drizzle.execute(
          `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' ORDER BY ordinal_position`
        )
        results.push(`  DB cols [${table}]: ${cols.rows.map((r: any) => r.column_name).join(', ')}`)
      } catch {
        results.push(`  Could not get cols for ${table}`)
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    results.push(`FATAL: ${msg.substring(0, 400)}`)
    return NextResponse.json({ ok: false, results, error: msg }, { status: 500 })
  }
}
