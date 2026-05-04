import { requirePortalSession } from '@/lib/portalAuth'
import Sidebar from './_components/Sidebar'
import TopBar from './_components/TopBar'

export const dynamic = 'force-dynamic'

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const { user, org } = await requirePortalSession()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          userName={user.name || user.email || 'User'}
          userEmail={user.email || ''}
          userRole={user.role as string}
          orgName={org?.name as string | undefined}
        />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
