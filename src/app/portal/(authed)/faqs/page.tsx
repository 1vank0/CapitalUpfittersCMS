import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Button, Badge } from '../_components/ui'
import CollectionList from '../_components/CollectionList'

export const dynamic = 'force-dynamic'

export default async function FaqsIndex() {
  const { payload, org } = await requirePortalSession()
  const { docs } = await payload.find({
    collection: 'faqs',
    where: org ? { organization: { equals: org.id } } : undefined,
    sort: 'sortOrder',
    limit: 200,
    depth: 0,
  })

  return (
    <>
      <PageHeader
        title="FAQs"
        subtitle="Reusable FAQ items, taggable by service and audience."
        actions={<Button href="/admin/collections/faqs/create">+ New FAQ</Button>}
      />
      <CollectionList
        docs={docs as any[]}
        collectionSlug="faqs"
        columns={[
          { key: 'question', label: 'Question' },
          {
            key: 'audience',
            label: 'Audience',
            render: (d: any) => (
              <div className="flex gap-1 flex-wrap">
                {(d.audience || []).map((a: string) => (
                  <Badge key={a} tone="gray">
                    {a}
                  </Badge>
                ))}
              </div>
            ),
          },
          {
            key: 'active',
            label: 'Active',
            render: (d: any) => (d.active ? '✓' : '—'),
          },
        ]}
      />
    </>
  )
}
