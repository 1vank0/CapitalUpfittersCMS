import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Button, Badge } from '../_components/ui'
import CollectionList from '../_components/CollectionList'

export const dynamic = 'force-dynamic'

export default async function QuotesIndex() {
  const { payload, org } = await requirePortalSession()
  const { docs } = await payload.find({
    collection: 'quotes',
    where: org ? { organization: { equals: org.id } } : undefined,
    sort: '-createdAt',
    limit: 200,
    depth: 0,
  })

  return (
    <>
      <PageHeader
        title="Quotes"
        subtitle="Generated quotes tied to leads."
        actions={<Button href="/admin/collections/quotes/create">+ New quote</Button>}
      />
      <CollectionList
        docs={docs as any[]}
        collectionSlug="quotes"
        columns={[
          { key: 'refId', label: 'Quote ID' },
          {
            key: 'status',
            label: 'Status',
            render: (d: any) => (
              <Badge tone={d.status === 'accepted' ? 'green' : d.status === 'sent' ? 'blue' : 'gray'}>
                {d.status}
              </Badge>
            ),
          },
          {
            key: 'totalEstimate',
            label: 'Total',
            render: (d: any) => (d.totalEstimate ? `$${d.totalEstimate}` : '—'),
          },
          {
            key: 'createdAt',
            label: 'Created',
            render: (d: any) => (
              <span className="text-xs text-[#6b7280]">
                {new Date(d.createdAt).toLocaleDateString()}
              </span>
            ),
          },
        ]}
      />
    </>
  )
}
