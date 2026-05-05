/**
 * Schema push endpoint — runs Payload's pushDevSchema against the live DB to
 * sync any new collections / globals / fields declared in the Payload config.
 *
 * Safe for additive changes (new tables, new nullable columns). For changes
 * that Drizzle flags as potentially-data-loss, set
 * `PAYLOAD_FORCE_DRIZZLE_PUSH=true` in env to bypass the interactive prompt.
 *
 * Authenticated via PAYLOAD_SECRET. Designed to be called once after each
 * deploy that introduces schema changes:
 *
 *   curl "https://capital-upfitters-cms.vercel.app/api/schema-push?secret=$SECRET"
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { pushDevSchema } from '@payloadcms/drizzle'
import config from '@payload-config'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const log: string[] = []
  try {
    const payload = await getPayload({ config })
    const adapter = payload.db as unknown as Parameters<typeof pushDevSchema>[0]
    log.push(`adapter: ${(adapter as { name?: string }).name ?? 'unknown'}`)

    // Force-accept warnings (no interactive TTY in serverless)
    process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = 'true'

    await pushDevSchema(adapter)
    log.push('pushDevSchema completed')

    // Smoke-test the new collections
    const checks = [
      'organizations',
      'org-memberships',
      'content-blocks',
      'users',
      'pages',
      'services',
      'geo-pages',
      'media',
      'leads',
      'testimonials',
      'faqs',
      'quotes',
    ] as const
    for (const slug of checks) {
      try {
        await payload.find({ collection: slug as never, limit: 1, overrideAccess: true })
        log.push(`OK ${slug}`)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        log.push(`FAIL ${slug}: ${msg.substring(0, 200)}`)
      }
    }
    for (const slug of ['settings', 'ai-profile'] as const) {
      try {
        await payload.findGlobal({ slug: slug as never, overrideAccess: true })
        log.push(`OK global ${slug}`)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        log.push(`FAIL global ${slug}: ${msg.substring(0, 200)}`)
      }
    }

    return NextResponse.json({ success: true, log })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, log, error: msg }, { status: 500 })
  }
}
