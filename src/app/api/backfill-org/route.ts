/**
 * Backfill endpoint — sets organization_id on existing rows that pre-date
 * the multi-tenant migration. Defaults to the Capital Upfitters org if no
 * `org` query param is provided.
 *
 * Authenticated via PAYLOAD_SECRET.
 *
 *   curl "https://capital-upfitters-cms.vercel.app/api/backfill-org?secret=$SECRET"
 *   curl "https://capital-upfitters-cms.vercel.app/api/backfill-org?secret=$SECRET&org=capital-upfitters"
 *
 * Only updates rows where organization_id IS NULL. Safe to re-run.
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const TABLES = [
  'pages',
  'services',
  'geo_pages',
  'media',
  'leads',
  'testimonials',
  'faqs',
  'quotes',
  'content_blocks',
] as const

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const orgSlug = searchParams.get('org') || 'capital-upfitters'

  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const orgs = await payload.find({
      collection: 'organizations',
      where: { slug: { equals: orgSlug } },
      limit: 1,
      overrideAccess: true,
    })
    const org = orgs.docs[0]
    if (!org) {
      return NextResponse.json(
        { error: `Organization with slug "${orgSlug}" not found. Run /api/seed first.` },
        { status: 404 },
      )
    }

    const orgId = (org as { id: number | string }).id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drizzle = (payload.db as any).drizzle
    const results: Record<string, { rows?: number; error?: string }> = {}

    for (const table of TABLES) {
      try {
        const res = await drizzle.execute(
          `UPDATE "${table}" SET organization_id = ${typeof orgId === 'number' ? orgId : `'${orgId}'`} WHERE organization_id IS NULL`,
        )
        results[table] = { rows: res.rowCount ?? 0 }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        results[table] = { error: msg.substring(0, 200) }
      }
    }

    return NextResponse.json({ success: true, org: { id: orgId, slug: orgSlug }, results })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
