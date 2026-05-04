/**
 * CollectionList — branded list view used across most CRUD pages.
 * Server component; receives docs and column config, renders a table
 * with row actions (Edit in admin, View in portal where available).
 */
import Link from 'next/link'
import { Card, Badge, EmptyState, Button } from './ui'

export type Column<T> = {
  key: string
  label: string
  render?: (doc: T) => React.ReactNode
  width?: string
}

export default function CollectionList<T extends { id: string | number }>({
  docs,
  columns,
  collectionSlug,
  portalEditPath,
  emptyTitle = 'Nothing here yet',
  emptyHint,
}: {
  docs: T[]
  columns: Column<T>[]
  collectionSlug: string
  portalEditPath?: (doc: T) => string
  emptyTitle?: string
  emptyHint?: string
}) {
  if (docs.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        hint={emptyHint}
        action={
          <Button variant="primary" href={`/admin/collections/${collectionSlug}/create`}>
            + Create new
          </Button>
        }
      />
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f9fafb] text-[11px] uppercase tracking-wider text-[#6b7280]">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="text-left font-semibold px-5 py-3"
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.label}
                </th>
              ))}
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr
                key={doc.id}
                className="border-t border-[#f3f4f6] hover:bg-[#f9fafb] transition"
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-5 py-3 align-top">
                    {c.render
                      ? c.render(doc)
                      : (doc as Record<string, unknown>)[c.key] as React.ReactNode}
                  </td>
                ))}
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  {portalEditPath && (
                    <Link
                      href={portalEditPath(doc)}
                      className="text-[#203055] hover:underline text-xs mr-3"
                    >
                      View
                    </Link>
                  )}
                  <Link
                    href={`/admin/collections/${collectionSlug}/${doc.id}`}
                    className="text-[#203055] hover:underline text-xs"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export { Badge }
