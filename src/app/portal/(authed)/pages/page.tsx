import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Button, Badge } from '../_components/ui'
import CollectionList from '../_components/CollectionList'

export const dynamic = 'force-dynamic'

export default async function PagesIndex() {
  const { payload, org } = await requirePortalSession()
  const { docs } = await payload.find({
    collection: 'pages',
    where: org ? { organization: { equals: org.id } } : undefined,
    sort: 'title',
    limit: 200,
    depth: 0,
  })

  return (
    <>
      <PageHeader
        title="Pages"
        subtitle="Top-level pages: home, audience hubs, landings, blog index."
        actions={
          <Button href="/admin/collections/pages/create">+ New page</Button>
        }
      />
      <CollectionList
        docs={docs as any[]}
        collectionSlug="pages"
        columns={[
          { key: 'title', label: 'Title' },
          {
            key: 'slug',
            label: 'Slug',
            render: (d: any) => <code className="text-xs text-[#6b7280]">/{d.slug}</code>,
          },
          {
            key: 'pageType',
            label: 'Type',
            render: (d: any) => (
              <span className="text-xs text-[#6b7280] capitalize">
                {d.pageType?.replace('-', ' ') || 'standard'}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (d: any) => (
              <Badge tone={d.status === 'published' ? 'green' : 'yellow'}>
                {d.status || 'draft'}
              </Badge>
            ),
          },
          {
            key: 'updatedAt',
            label: 'Updated',
            render: (d: any) => (
              <span className="text-xs text-[#6b7280]">
                {new Date(d.updatedAt).toLocaleDateString()}
              </span>
            ),
          },
        ]}
      />
    </>
  )
}
