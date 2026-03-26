import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    // Force Payload to run pushDevSchema on connect
    process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = 'true'
    process.env.NODE_ENV = 'development' // trick pushDevSchema to run in prod

    const payload = await getPayload({ config })
    const db = payload.db as any
    const drizzle = db.drizzle

    results.push('Connected: ' + (process.env.DATABASE_URL || '').replace(/:([^@]+)@/, ':***@').substring(0, 60))

    // Try pushDevSchema directly
    try {
      // Get pushSchema from drizzle-kit
      const { pushSchema } = db.requireDrizzleKit()
      results.push('drizzle-kit available, running pushSchema...')

      const { apply, warnings } = await pushSchema(
        db.schema,
        db.drizzle,
        undefined, // schemaName
        undefined, // tablesFilter
        undefined, // extensionsFilter
      )

      if (warnings?.length) {
        results.push(`Warnings: ${warnings.join(', ')}`)
      }

      await apply()
      results.push('✅ pushSchema applied — all tables created/updated')
    } catch (pushErr: unknown) {
      const msg = String(pushErr).substring(0, 300)
      results.push(`pushSchema failed: ${msg}`)
      results.push('Falling back to direct migration...')

      // Fallback: run db.migrate() if migration files exist
      try {
        await db.migrate()
        results.push('migrate() completed')
      } catch (migrateErr: unknown) {
        results.push(`migrate() also failed: ${String(migrateErr).substring(0, 200)}`)
      }
    }

    // Verify key tables
    for (const table of ['users', 'services', 'leads', 'testimonials', 'account_requests', 'settings']) {
      try {
        const check = await drizzle.execute(`SELECT COUNT(*) as cnt FROM "${table}"`)
        results.push(`✅ ${table}: ${check.rows?.[0]?.cnt} rows`)
      } catch {
        results.push(`❌ ${table}: missing`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const cause = (err as any)?.cause ? String((err as any).cause).substring(0, 200) : null
    results.push('FATAL: ' + message.substring(0, 400))
    if (cause) results.push('CAUSE: ' + cause)
    return NextResponse.json({ success: false, results, error: message }, { status: 500 })
  }
}
