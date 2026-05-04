import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auditDoc, auditSiteWide } from '@/lib/seoAudit'

/**
 * Authenticated SEO audit endpoint. Returns warnings for all pages,
 * services, and locations in the caller's organization.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await getPayload({ config })
  const headers = await nextHeaders()
  const { user } = await payload.auth({ headers })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orgId = (user as { defaultOrganization?: string | number }).defaultOrganization
  const where = orgId ? { organization: { equals: orgId } } : undefined

  const [pages, services, locations] = await Promise.all([
    payload.find({ collection: 'pages', where, limit: 500, depth: 0 }),
    payload.find({ collection: 'services', where, limit: 500, depth: 0 }),
    payload.find({ collection: 'geo-pages', where, limit: 500, depth: 0 }),
  ])

  const all = [...pages.docs, ...services.docs, ...locations.docs] as any[]
  const perDoc = all.map((d) => ({
    id: d.id,
    title: d.title || d.name || d.city,
    slug: d.slug,
    warnings: auditDoc(d),
  }))
  const siteWide = auditSiteWide(all)

  return NextResponse.json({ perDoc, siteWide, totals: {
    docs: all.length,
    errors: perDoc.flatMap((d) => d.warnings).filter((w) => w.severity === 'error').length
      + siteWide.filter((w) => w.severity === 'error').length,
    warnings: perDoc.flatMap((d) => d.warnings).filter((w) => w.severity === 'warning').length
      + siteWide.filter((w) => w.severity === 'warning').length,
  }})
}
