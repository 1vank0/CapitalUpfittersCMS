import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Button, EmptyState } from '../_components/ui'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function GalleryIndex() {
  const { payload, org } = await requirePortalSession()
  const { docs } = await payload.find({
    collection: 'media',
    where: org ? { organization: { equals: org.id } } : undefined,
    sort: '-createdAt',
    limit: 100,
    depth: 1,
  })

  return (
    <>
      <PageHeader
        title="Media Library"
        subtitle="Images and videos. Categorized, taggable, reusable across pages."
        actions={<Button href="/admin/collections/media/create">+ Upload</Button>}
      />

      {docs.length === 0 ? (
        <EmptyState
          title="No media yet"
          hint="Upload your first image to start building galleries and service pages."
          action={<Button href="/admin/collections/media/create">+ Upload first image</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {docs.map((m: any) => {
            const thumb =
              m.sizes?.thumbnail?.url ||
              m.url ||
              `/api/media/file/${m.filename}`
            return (
              <Link
                key={m.id}
                href={`/admin/collections/media/${m.id}`}
                className="group bg-white border border-[#e5e7eb] rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <div className="aspect-[4/3] bg-[#f3f4f6] overflow-hidden">
                  {thumb ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={thumb}
                      alt={m.alt || ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
                      ◰
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs font-medium truncate">{m.alt || m.filename}</div>
                  <div className="text-[11px] text-[#6b7280] truncate mt-0.5">
                    {m.category || 'uncategorized'}
                    {m.featured && <span className="ml-1.5 text-[#eab308]">★</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
