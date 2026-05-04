import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, StatCard, Card, Badge } from './_components/ui'
import { auditDoc, auditSiteWide } from '@/lib/seoAudit'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { user, payload, org } = await requirePortalSession()
  const orgFilter = org ? { organization: { equals: org.id } } : undefined

  const [
    leadsTotal,
    leadsNew,
    quotesTotal,
    pages,
    services,
    locations,
    media,
    blocks,
    pagesAll,
    servicesAll,
    locationsAll,
    recentLeads,
    recentEdits,
    draftsP,
    draftsS,
    draftsL,
  ] = await Promise.all([
    payload.count({ collection: 'leads', where: orgFilter }),
    payload.count({
      collection: 'leads',
      where: { ...(orgFilter || {}), status: { equals: 'new' } },
    }),
    payload.count({ collection: 'quotes', where: orgFilter }),
    payload.count({ collection: 'pages', where: orgFilter }),
    payload.count({
      collection: 'services',
      where: { ...(orgFilter || {}), active: { equals: true } },
    }),
    payload.count({
      collection: 'geo-pages',
      where: { ...(orgFilter || {}), active: { equals: true } },
    }),
    payload.count({ collection: 'media', where: orgFilter }),
    payload.count({ collection: 'content-blocks', where: orgFilter }),
    payload.find({ collection: 'pages', where: orgFilter, limit: 200, depth: 0 }),
    payload.find({ collection: 'services', where: orgFilter, limit: 200, depth: 0 }),
    payload.find({ collection: 'geo-pages', where: orgFilter, limit: 200, depth: 0 }),
    payload.find({
      collection: 'leads',
      where: orgFilter,
      sort: '-createdAt',
      limit: 5,
      depth: 0,
    }),
    payload.find({
      collection: 'pages',
      where: orgFilter,
      sort: '-updatedAt',
      limit: 5,
      depth: 0,
    }),
    payload.count({
      collection: 'pages',
      where: { ...(orgFilter || {}), status: { equals: 'draft' } },
    }),
    payload.count({
      collection: 'services',
      where: { ...(orgFilter || {}), active: { equals: false } },
    }),
    payload.count({
      collection: 'geo-pages',
      where: { ...(orgFilter || {}), active: { equals: false } },
    }),
  ])

  // SEO warnings — combine per-doc + site-wide
  const allDocs = [...pagesAll.docs, ...servicesAll.docs, ...locationsAll.docs] as any[]
  const perDoc = allDocs.flatMap((d) => auditDoc(d))
  const siteWide = auditSiteWide(allDocs)
  const warningsTotal = perDoc.length + siteWide.length
  const errorsTotal = [...perDoc, ...siteWide].filter((w) => w.severity === 'error').length

  const draftsTotal = draftsP.totalDocs + draftsS.totalDocs + draftsL.totalDocs

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name || user.email}`}
        subtitle={`You're managing ${org?.name || 'Capital Upfitters'}.`}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Leads"
          value={leadsTotal.totalDocs}
          hint={`${leadsNew.totalDocs} new`}
          href="/portal/leads"
        />
        <StatCard
          label="Quote Requests"
          value={quotesTotal.totalDocs}
          href="/portal/quotes"
        />
        <StatCard label="Pages" value={pages.totalDocs} href="/portal/pages" />
        <StatCard
          label="Services"
          value={services.totalDocs}
          hint="Active"
          href="/portal/services"
        />
        <StatCard
          label="Locations"
          value={locations.totalDocs}
          hint="Active geo pages"
          href="/portal/locations"
        />
        <StatCard label="Gallery Images" value={media.totalDocs} href="/portal/gallery" />
        <StatCard
          label="SEO Warnings"
          value={warningsTotal}
          hint={errorsTotal > 0 ? `${errorsTotal} errors` : 'All looks good'}
          href="/portal/seo"
          tone={errorsTotal > 0 ? 'error' : warningsTotal > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label="Drafts / Inactive"
          value={draftsTotal}
          hint="Pages, services, locations"
          tone={draftsTotal > 0 ? 'warning' : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#e5e7eb] flex items-center justify-between">
            <h2 className="font-semibold text-[#111827]">Recent leads</h2>
            <Link href="/portal/leads" className="text-xs text-[#203055] hover:underline">
              View all →
            </Link>
          </div>
          {recentLeads.docs.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#6b7280]">
              No leads yet. Submissions from the public site will land here.
            </div>
          ) : (
            <div>
              {recentLeads.docs.map((lead: any) => (
                <Link
                  key={lead.id}
                  href={`/portal/leads/${lead.id}`}
                  className="flex items-center justify-between px-5 py-3 border-b last:border-b-0 border-[#f3f4f6] hover:bg-[#f9fafb] transition"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {lead.name || '(no name)'}
                    </div>
                    <div className="text-xs text-[#6b7280] truncate">
                      {lead.refId} · {lead.service || 'general'}
                    </div>
                  </div>
                  <Badge
                    tone={
                      lead.status === 'won'
                        ? 'green'
                        : lead.status === 'lost'
                        ? 'red'
                        : lead.status === 'new'
                        ? 'blue'
                        : 'gray'
                    }
                  >
                    {lead.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#e5e7eb] flex items-center justify-between">
            <h2 className="font-semibold text-[#111827]">Recent updates</h2>
            <Link href="/portal/pages" className="text-xs text-[#203055] hover:underline">
              All pages →
            </Link>
          </div>
          {recentEdits.docs.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#6b7280]">
              No pages yet.{' '}
              <Link href="/portal/pages/new" className="text-[#203055] underline">
                Create one
              </Link>
              .
            </div>
          ) : (
            <div>
              {recentEdits.docs.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/portal/pages/${p.id}`}
                  className="flex items-center justify-between px-5 py-3 border-b last:border-b-0 border-[#f3f4f6] hover:bg-[#f9fafb] transition"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p.title}</div>
                    <div className="text-xs text-[#6b7280] truncate">/{p.slug}</div>
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
