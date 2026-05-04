import { headers as nextHeaders, cookies as nextCookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Server-side helper that loads the current user and their default org.
 * Use in server components and API routes inside /portal.
 */
export async function getPortalSession() {
  const payload = await getPayload({ config })
  const headers = await nextHeaders()

  const { user } = await payload.auth({ headers })
  if (!user) return { user: null, org: null, payload }

  let org: Awaited<ReturnType<typeof payload.findByID>> | null = null
  const defaultOrgId = (user as { defaultOrganization?: string | number })
    .defaultOrganization
  if (defaultOrgId) {
    try {
      org = await payload.findByID({
        collection: 'organizations',
        id: defaultOrgId,
        depth: 1,
      })
    } catch {
      org = null
    }
  }

  return { user, org, payload }
}

export async function requirePortalSession() {
  const session = await getPortalSession()
  if (!session.user) {
    redirect('/portal/login')
  }
  return session as Awaited<ReturnType<typeof getPortalSession>> & {
    user: NonNullable<Awaited<ReturnType<typeof getPortalSession>>['user']>
  }
}

export async function clearPortalCookie() {
  const cookieStore = await nextCookies()
  cookieStore.delete('payload-token')
}
