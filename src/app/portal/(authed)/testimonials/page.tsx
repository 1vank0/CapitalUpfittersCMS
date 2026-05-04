import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Button, Badge } from '../_components/ui'
import CollectionList from '../_components/CollectionList'

export const dynamic = 'force-dynamic'

export default async function TestimonialsIndex() {
  const { payload, org } = await requirePortalSession()
  const { docs } = await payload.find({
    collection: 'testimonials',
    where: org ? { organization: { equals: org.id } } : undefined,
    sort: '-createdAt',
    limit: 200,
    depth: 0,
  })

  return (
    <>
      <PageHeader
        title="Testimonials"
        subtitle="Customer reviews used on the homepage and service pages."
        actions={<Button href="/admin/collections/testimonials/create">+ New testimonial</Button>}
      />
      <CollectionList
        docs={docs as any[]}
        collectionSlug="testimonials"
        columns={[
          { key: 'customerName', label: 'Customer' },
          {
            key: 'quote',
            label: 'Quote',
            render: (d: any) => (
              <span className="text-xs text-[#374151] block max-w-lg truncate">
                “{d.quote}”
              </span>
            ),
          },
          {
            key: 'rating',
            label: 'Rating',
            render: (d: any) => <span className="text-xs">{'⭐'.repeat(Number(d.rating || 5))}</span>,
          },
          {
            key: 'featured',
            label: 'Featured',
            render: (d: any) => (d.featured ? <Badge tone="navy">Featured</Badge> : null),
          },
        ]}
      />
    </>
  )
}
