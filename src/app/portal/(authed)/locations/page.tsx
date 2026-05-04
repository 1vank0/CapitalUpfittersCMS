import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Button, Badge } from '../_components/ui'
import CollectionList from '../_components/CollectionList'

export const dynamic = 'force-dynamic'

export default async function LocationsIndex() {
  const { payload, org } = await requirePortalSession()
  const { docs } = await payload.find({
    collection: 'geo-pages',
    where: org ? { organization: { equals: org.id } } : undefined,
    sort: 'city',
    limit: 200,
    depth: 0,
  })

  return (
    <>
      <PageHeader
        title="Locations"
        subtitle="Geo / city pages for local SEO across the DMV."
        actions={<Button href="/admin/collections/geo-pages/create">+ New location</Button>}
      />
      <CollectionList
        docs={docs as any[]}
        collectionSlug="geo-pages"
        columns={[
          { key: 'city', label: 'City' },
          {
            key: 'state',
            label: 'State',
            render: (d: any) => <span className="text-xs">{d.state}</span>,
          },
          {
            key: 'slug',
            label: 'Slug',
            render: (d: any) => <code className="text-xs text-[#6b7280]">/{d.slug}</code>,
          },
          {
            key: 'services',
            label: 'Services',
            render: (d: any) => (
              <span className="text-xs text-[#6b7280]">
                {Array.isArray(d.services) ? d.services.length : 0} linked
              </span>
            ),
          },
          {
            key: 'active',
            label: 'Status',
            render: (d: any) => (
              <Badge tone={d.active ? 'green' : 'gray'}>
                {d.active ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
        ]}
      />
    </>
  )
}
