import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Card, Badge, EmptyState, Button } from '../_components/ui'
import Link from 'next/link'
import type { Where } from 'payload'

export const dynamic = 'force-dynamic'

const STATUSES = [
  { value: 'new', label: 'New', tone: 'blue' as const },
  { value: 'contacted', label: 'Contacted', tone: 'gray' as const },
  { value: 'quoted', label: 'Quoted', tone: 'navy' as const },
  { value: 'scheduled', label: 'Scheduled', tone: 'yellow' as const },
  { value: 'won', label: 'Won', tone: 'green' as const },
  { value: 'lost', label: 'Lost', tone: 'red' as const },
]

export default async function LeadsInbox({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const { payload, org } = await requirePortalSession()
  const sp = await searchParams

  const where: Where = {}
  if (org) where.organization = { equals: org.id }
  if (sp.status) where.status = { equals: sp.status }
  if (sp.type) where.leadType = { equals: sp.type }

  const { docs, totalDocs } = await payload.find({
    collection: 'leads',
    where,
    sort: '-createdAt',
    limit: 100,
    depth: 0,
  })

  // Status counts (per-status totals for filter chips)
  const counts = await Promise.all(
    STATUSES.map((s) =>
      payload
        .count({
          collection: 'leads',
          where: org
            ? { organization: { equals: org.id }, status: { equals: s.value } }
            : { status: { equals: s.value } },
        })
        .then((r) => ({ status: s.value, count: r.totalDocs }))
    )
  )

  return (
    <>
      <PageHeader
        title="Lead Inbox"
        subtitle={`${totalDocs} ${totalDocs === 1 ? 'lead' : 'leads'} ${sp.status ? `· filtered: ${sp.status}` : ''}`}
        actions={
          <Button variant="secondary" href="/admin/collections/leads">
            Open admin view
          </Button>
        }
      />

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          href="/portal/leads"
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
            !sp.status ? 'bg-[#203055] text-white border-[#203055]' : 'bg-white border-[#e5e7eb] text-[#374151] hover:bg-[#f3f4f6]'
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => {
          const count = counts.find((c) => c.status === s.value)?.count ?? 0
          const active = sp.status === s.value
          return (
            <Link
              key={s.value}
              href={`/portal/leads?status=${s.value}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                active
                  ? 'bg-[#203055] text-white border-[#203055]'
                  : 'bg-white border-[#e5e7eb] text-[#374151] hover:bg-[#f3f4f6]'
              }`}
            >
              {s.label}{' '}
              <span className={active ? 'text-white/70' : 'text-[#9ca3af]'}>
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {docs.length === 0 ? (
        <EmptyState
          title="No leads match this filter"
          hint="Public form submissions will appear here in real time."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f9fafb] text-[11px] uppercase tracking-wider text-[#6b7280]">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Ref</th>
                  <th className="text-left font-semibold px-5 py-3">Name</th>
                  <th className="text-left font-semibold px-5 py-3">Contact</th>
                  <th className="text-left font-semibold px-5 py-3">Service</th>
                  <th className="text-left font-semibold px-5 py-3">Source</th>
                  <th className="text-left font-semibold px-5 py-3">Status</th>
                  <th className="text-left font-semibold px-5 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((lead: any) => (
                  <tr
                    key={lead.id}
                    className="border-t border-[#f3f4f6] hover:bg-[#f9fafb] transition cursor-pointer"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-[#6b7280]">
                      <Link href={`/portal/leads/${lead.id}`} className="hover:underline">
                        {lead.refId}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/portal/leads/${lead.id}`} className="font-medium hover:underline">
                        {lead.name || '—'}
                      </Link>
                      {lead.company && (
                        <div className="text-xs text-[#6b7280]">{lead.company}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {lead.email && <div className="text-[#374151]">{lead.email}</div>}
                      {lead.phone && <div className="text-[#6b7280]">{lead.phone}</div>}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#374151] capitalize">
                      {lead.service?.replace('-', ' ') || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="gray">{lead.leadType}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        tone={
                          STATUSES.find((s) => s.value === lead.status)?.tone || 'gray'
                        }
                      >
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6b7280] whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}
