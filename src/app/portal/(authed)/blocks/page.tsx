import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Button } from '../_components/ui'
import CollectionList from '../_components/CollectionList'

export const dynamic = 'force-dynamic'

export default async function BlocksIndex() {
  const { payload, org } = await requirePortalSession()
  const { docs } = await payload.find({
    collection: 'content-blocks',
    where: org ? { organization: { equals: org.id } } : undefined,
    sort: 'name',
    limit: 200,
    depth: 0,
  })

  return (
    <>
      <PageHeader
        title="Content Blocks"
        subtitle="Reusable blocks: heroes, CTAs, FAQs, galleries, comparisons, pricing."
        actions={<Button href="/admin/collections/content-blocks/create">+ New block</Button>}
      />
      <CollectionList
        docs={docs as any[]}
        collectionSlug="content-blocks"
        columns={[
          { key: 'name', label: 'Name' },
          {
            key: 'blockType',
            label: 'Type',
            render: (d: any) => <span className="text-xs capitalize">{d.blockType}</span>,
          },
          {
            key: 'headline',
            label: 'Headline',
            render: (d: any) => (
              <span className="text-xs text-[#6b7280] truncate block max-w-md">
                {d.headline || '—'}
              </span>
            ),
          },
        ]}
      />
    </>
  )
}
