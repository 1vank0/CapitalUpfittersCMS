import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Button, Badge } from '../_components/ui'
import CollectionList from '../_components/CollectionList'

export const dynamic = 'force-dynamic'

export default async function OrganizationsIndex() {
  const { payload } = await requirePortalSession()
  const { docs } = await payload.find({
    collection: 'organizations',
    sort: 'name',
    limit: 200,
    depth: 0,
  })

  return (
    <>
      <PageHeader
        title="Organizations"
        subtitle="Tenants of the Upfit Portal. Capital Upfitters is the first."
        actions={
          <Button href="/admin/collections/organizations/create">+ New organization</Button>
        }
      />
      <CollectionList
        docs={docs as any[]}
        collectionSlug="organizations"
        columns={[
          { key: 'name', label: 'Name' },
          {
            key: 'type',
            label: 'Type',
            render: (d: any) => <span className="text-xs capitalize">{d.type}</span>,
          },
          {
            key: 'plan',
            label: 'Plan',
            render: (d: any) => <Badge tone="navy">{d.plan}</Badge>,
          },
          {
            key: 'status',
            label: 'Status',
            render: (d: any) => (
              <Badge tone={d.status === 'active' ? 'green' : 'gray'}>{d.status}</Badge>
            ),
          },
        ]}
      />
    </>
  )
}
