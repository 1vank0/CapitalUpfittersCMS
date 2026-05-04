import { redirect } from 'next/navigation'
import { getPortalSession } from '@/lib/portalAuth'
import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const { user } = await getPortalSession()
  if (user) redirect('/portal')

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[#f7f8fa]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#203055] flex items-center justify-center text-white font-bold">
                U
              </div>
              <span className="portal-display text-2xl font-bold tracking-tight">
                Upfit Portal
              </span>
            </div>
            <p className="text-sm text-[#6b7280]">
              Sign in to manage Capital Upfitters
            </p>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-8">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs text-[#9ca3af]">
            Need access? Ask the Owner to create an account, or{' '}
            <a href="/admin" className="underline hover:text-[#203055]">
              use the legacy admin
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
