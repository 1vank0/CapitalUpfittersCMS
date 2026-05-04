import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Button, Badge } from '../_components/ui'
import CollectionList from '../_components/CollectionList'

export const dynamic = 'force-dynamic'

export default async function UsersIndex() {
  const { payload } = await requirePortalSession()
  const { docs } = await payload.find({
    collection: 'users',
    sort: 'email',
    limit: 200,
    depth: 0,
  })

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="People with access to the Upfit Portal."
        actions={<Button href="/admin/collections/users/create">+ Invite user</Button>}
      />
      <CollectionList
        docs={docs as any[]}
        collectionSlug="users"
        columns={[
          { key: 'email', label: 'Email' },
          { key: 'name', label: 'Name' },
          {
            key: 'role',
            label: 'Role',
            render: (d: any) => (
              <Badge tone={d.role === 'super-admin' || d.role === 'owner' ? 'navy' : 'gray'}>
                {d.role}
              </Badge>
            ),
          },
          {
            key: 'lastLogin',
            label: 'Last login',
            render: (d: any) => (
              <span className="text-xs text-[#6b7280]">
                {d.lastLogin ? new Date(d.lastLogin).toLocaleDateString() : '—'}
              </span>
            ),
          },
        ]}
      />
    </>
  )
}
