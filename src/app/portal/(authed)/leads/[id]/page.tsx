import { notFound } from 'next/navigation'
import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Card, Badge, Button } from '../../_components/ui'
import LeadStatusForm from './LeadStatusForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LeadDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { payload } = await requirePortalSession()
  const { id } = await params

  let lead: any
  try {
    lead = await payload.findByID({ collection: 'leads', id, depth: 1 })
  } catch {
    notFound()
  }
  if (!lead) notFound()

  return (
    <>
      <Link href="/portal/leads" className="text-sm text-[#6b7280] hover:underline">
        ← Back to inbox
      </Link>
      <PageHeader
        title={lead.name || '(no name)'}
        subtitle={`${lead.refId} · ${new Date(lead.createdAt).toLocaleString()}`}
        actions={
          <>
            <Button variant="secondary" href={`/admin/collections/leads/${lead.id}`}>
              Full editor
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-4">
              Contact
            </h2>
            <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <Field label="Name" value={lead.name} />
              <Field label="Phone" value={lead.phone} copy />
              <Field label="Email" value={lead.email} copy />
              <Field label="Company" value={lead.company} />
              <Field label="Vehicle" value={[lead.vehicleYear, lead.vehicleMake].filter(Boolean).join(' ')} />
              <Field label="Fleet size" value={lead.fleetSize} />
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-4">
              Request
            </h2>
            <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm mb-4">
              <Field label="Type" value={lead.leadType} />
              <Field label="Service" value={lead.service} />
              <Field label="Source" value={lead.source} />
              <Field label="Priority" value={lead.priority} />
            </dl>
            {lead.message && (
              <div className="mt-4 pt-4 border-t border-[#f3f4f6]">
                <div className="text-xs uppercase tracking-wider text-[#6b7280] font-semibold mb-1.5">
                  Message
                </div>
                <p className="text-sm text-[#111827] whitespace-pre-wrap">{lead.message}</p>
              </div>
            )}
          </Card>

          {Array.isArray(lead.notes) && lead.notes.length > 0 && (
            <Card className="p-6">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-4">
                Internal notes
              </h2>
              <div className="space-y-3">
                {lead.notes.map((n: any, i: number) => (
                  <div
                    key={i}
                    className="border-l-2 border-[#e5e7eb] pl-3 py-1 text-sm text-[#374151]"
                  >
                    <div className="whitespace-pre-wrap">{n.note}</div>
                    <div className="text-[11px] text-[#9ca3af] mt-1">
                      {n.createdAt && new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar — status / quick actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-4">
              Status
            </h2>
            <LeadStatusForm leadId={String(lead.id)} currentStatus={lead.status} currentPriority={lead.priority} />
          </Card>

          <Card className="p-6 text-sm">
            <h2 className="font-semibold uppercase tracking-wider text-[#6b7280] text-xs mb-3">
              Meta
            </h2>
            <div className="space-y-1.5 text-xs text-[#6b7280]">
              <div>Created: {new Date(lead.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(lead.updatedAt).toLocaleString()}</div>
              {lead.followUpDate && (
                <div>Follow-up: {new Date(lead.followUpDate).toLocaleDateString()}</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

function Field({
  label,
  value,
  copy = false,
}: {
  label: string
  value?: React.ReactNode
  copy?: boolean
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[#6b7280] font-semibold mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-[#111827]">
        {value || <span className="text-[#9ca3af]">—</span>}
        {copy && value && (
          <span className="ml-2 text-[#9ca3af] text-xs">·</span>
        )}
      </dd>
    </div>
  )
}
