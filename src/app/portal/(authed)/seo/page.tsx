import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Card, StatCard, Badge } from '../_components/ui'
import { auditDoc, auditSiteWide, type SeoWarning } from '@/lib/seoAudit'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type AuditedDoc = {
  id: string | number
  type: 'page' | 'service' | 'location'
  title: string
  slug?: string
  collectionSlug: string
  warnings: SeoWarning[]
}

export default async function SeoManager() {
  const { payload, org } = await requirePortalSession()
  const where = org ? { organization: { equals: org.id } } : undefined

  const [pagesRes, servicesRes, locationsRes] = await Promise.all([
    payload.find({ collection: 'pages', where, limit: 200, depth: 0 }),
    payload.find({ collection: 'services', where, limit: 200, depth: 0 }),
    payload.find({ collection: 'geo-pages', where, limit: 200, depth: 0 }),
  ])

  const audited: AuditedDoc[] = [
    ...pagesRes.docs.map((d: any) => ({
      id: d.id,
      type: 'page' as const,
      title: d.title,
      slug: d.slug,
      collectionSlug: 'pages',
      warnings: auditDoc(d),
    })),
    ...servicesRes.docs.map((d: any) => ({
      id: d.id,
      type: 'service' as const,
      title: d.name,
      slug: d.slug,
      collectionSlug: 'services',
      warnings: auditDoc(d),
    })),
    ...locationsRes.docs.map((d: any) => ({
      id: d.id,
      type: 'location' as const,
      title: d.city,
      slug: d.slug,
      collectionSlug: 'geo-pages',
      warnings: auditDoc(d),
    })),
  ]

  const allDocsForSiteWide = [
    ...pagesRes.docs,
    ...servicesRes.docs,
    ...locationsRes.docs,
  ] as any[]
  const siteWide = auditSiteWide(allDocsForSiteWide)

  const errorCount = audited.reduce(
    (n, d) => n + d.warnings.filter((w) => w.severity === 'error').length,
    0,
  ) + siteWide.filter((w) => w.severity === 'error').length

  const warningCount = audited.reduce(
    (n, d) => n + d.warnings.filter((w) => w.severity === 'warning').length,
    0,
  ) + siteWide.filter((w) => w.severity === 'warning').length

  const cleanCount = audited.filter((d) => d.warnings.length === 0).length

  const sorted = [...audited].sort((a, b) => b.warnings.length - a.warnings.length)

  return (
    <>
      <PageHeader
        title="SEO Manager"
        subtitle="Site-wide audit. Live checks across pages, services, and locations."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Errors"
          value={errorCount}
          tone={errorCount > 0 ? 'error' : 'success'}
          hint="Must fix"
        />
        <StatCard
          label="Warnings"
          value={warningCount}
          tone={warningCount > 0 ? 'warning' : 'success'}
          hint="Should fix"
        />
        <StatCard label="Clean records" value={cleanCount} tone="success" />
        <StatCard label="Records audited" value={audited.length} />
      </div>

      {siteWide.length > 0 && (
        <Card className="p-5 mb-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-3">
            Site-wide issues
          </h2>
          <div className="space-y-2">
            {siteWide.map((w, i) => (
              <WarningRow key={i} warning={w} />
            ))}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e5e7eb] bg-[#f9fafb]">
          <h2 className="font-semibold text-sm">Per-record audit</h2>
        </div>
        <div className="divide-y divide-[#f3f4f6]">
          {sorted.map((doc) => {
            const errors = doc.warnings.filter((w) => w.severity === 'error').length
            const warnings = doc.warnings.filter((w) => w.severity === 'warning').length
            return (
              <div key={`${doc.type}-${doc.id}`} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Link
                      href={`/admin/collections/${doc.collectionSlug}/${doc.id}`}
                      className="font-medium text-[#111827] hover:underline"
                    >
                      {doc.title}
                    </Link>
                    <span className="ml-2 text-xs text-[#6b7280]">
                      {doc.type} · /{doc.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {errors > 0 && <Badge tone="red">{errors} errors</Badge>}
                    {warnings > 0 && <Badge tone="yellow">{warnings} warnings</Badge>}
                    {doc.warnings.length === 0 && <Badge tone="green">All clear</Badge>}
                  </div>
                </div>
                {doc.warnings.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {doc.warnings.map((w, i) => (
                      <WarningRow key={i} warning={w} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </>
  )
}

function WarningRow({ warning }: { warning: SeoWarning }) {
  const dot =
    warning.severity === 'error'
      ? 'bg-red-500'
      : warning.severity === 'warning'
      ? 'bg-yellow-500'
      : 'bg-blue-500'
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className={`mt-1 w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
      <div>
        <span className="text-[#374151]">{warning.message}</span>
        {warning.suggestion && (
          <span className="text-[#6b7280] ml-1">— {warning.suggestion}</span>
        )}
      </div>
    </div>
  )
}
