import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Button, Badge } from '../_components/ui'
import CollectionList from '../_components/CollectionList'

export const dynamic = 'force-dynamic'

const CATEGORY_LABELS: Record<string, string> = {
  bedliners: 'Bedliners',
  hitches: 'Hitches & Towing',
  undercoating: 'Undercoating',
  'ceramic-ppf': 'Ceramic & PPF',
  accessories: 'Accessories',
  tonneau: 'Tonneau',
  'running-boards': 'Running Boards',
  'van-upfits': 'Van Upfits',
  fleet: 'Fleet',
  dealer: 'Dealer',
  government: 'Government',
  industrial: 'Industrial Coatings',
}

export default async function ServicesIndex() {
  const { payload, org } = await requirePortalSession()
  const { docs } = await payload.find({
    collection: 'services',
    where: org ? { organization: { equals: org.id } } : undefined,
    sort: 'sortOrder',
    limit: 200,
    depth: 0,
  })

  return (
    <>
      <PageHeader
        title="Services"
        subtitle="Editable service catalog. Categories, pricing, FAQ, gallery, SEO."
        actions={<Button href="/admin/collections/services/create">+ New service</Button>}
      />
      <CollectionList
        docs={docs as any[]}
        collectionSlug="services"
        columns={[
          { key: 'name', label: 'Name' },
          {
            key: 'category',
            label: 'Category',
            render: (d: any) => (
              <span className="text-xs text-[#374151]">
                {CATEGORY_LABELS[d.category] || d.category}
              </span>
            ),
          },
          {
            key: 'price',
            label: 'Price',
            render: (d: any) => (
              <span className="text-xs text-[#6b7280]">
                {d.priceLabel ||
                  (d.priceFrom
                    ? `From $${d.priceFrom}${d.priceTo ? `–$${d.priceTo}` : ''}`
                    : '—')}
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
