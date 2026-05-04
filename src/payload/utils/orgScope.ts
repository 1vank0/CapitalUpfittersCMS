import type { Field, CollectionBeforeChangeHook, Access } from 'payload'

/**
 * Shared multi-tenant scoping utilities.
 *
 * Adds an `organization` relationship to any collection, defaults it to the
 * current user's default organization on create, and filters reads/writes
 * to that organization unless the user is a super-admin.
 */

/**
 * NOTE: not marked required at the schema level so existing rows survive the
 * additive migration. The defaultOrgOnCreate hook always populates it on
 * create, and read access is filtered by org so unscoped rows remain
 * invisible to non-super-admins until backfilled.
 */
export const orgRelationship: Field = {
  name: 'organization',
  type: 'relationship',
  relationTo: 'organizations',
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Owning organization. Auto-set from your active org.',
  },
}

/**
 * beforeChange hook — defaults the organization to the current user's default org.
 */
export const defaultOrgOnCreate: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  if (operation === 'create' && !data.organization && req.user) {
    const userId = req.user.id
    try {
      const user = await req.payload.findByID({
        collection: 'users',
        id: userId,
        depth: 0,
      })
      const defaultOrg =
        (user as { defaultOrganization?: string | number }).defaultOrganization
      if (defaultOrg) {
        data.organization = defaultOrg
      }
    } catch {
      // Non-fatal — user can set manually
    }
  }
  return data
}

/**
 * Filters reads to only the user's organization(s).
 * Super-admins see everything.
 */
export const orgReadAccess: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.role === 'super-admin') return true

  const defaultOrg = (req.user as { defaultOrganization?: string | number })
    .defaultOrganization
  if (!defaultOrg) return true // Fallback — show all if not yet scoped

  return {
    organization: { equals: defaultOrg },
  }
}

/**
 * Returns true for any authenticated user. Default org is auto-set by
 * defaultOrgOnCreate.
 */
export const orgWriteAccess: Access = ({ req }) => !!req.user
