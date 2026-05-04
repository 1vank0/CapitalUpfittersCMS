import type { CollectionConfig } from 'payload'

/**
 * Users — extracted from inline config in payload.config.ts and extended
 * with the full Upfit Portal role system.
 *
 * Per-organization roles live on `org-memberships`. The `role` field here
 * is the user's *global* role across the whole system:
 *   - super-admin: Perplexity / system operator (us)
 *   - owner: shop / dealer owner — can manage their org(s)
 *   - admin: org admin (delegated)
 *   - editor: content editor
 *   - staff: limited access
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7, // 7 days
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  admin: {
    useAsTitle: 'email',
    group: 'System',
    defaultColumns: ['email', 'name', 'role', 'lastLogin'],
  },
  access: {
    create: ({ req }) =>
      req.user?.role === 'super-admin' ||
      req.user?.role === 'owner' ||
      req.user?.role === 'admin',
    read: ({ req }) => !!req.user,
    update: ({ req, id }) => {
      if (!req.user) return false
      // Self-update always allowed
      if (req.user.id === id) return true
      return ['super-admin', 'owner', 'admin'].includes(req.user.role as string)
    },
    delete: ({ req }) =>
      req.user?.role === 'super-admin' || req.user?.role === 'owner',
  },
  hooks: {
    afterLogin: [
      async ({ req, user }) => {
        try {
          await req.payload.update({
            collection: 'users',
            id: user.id,
            data: { lastLogin: new Date().toISOString() },
            overrideAccess: true,
          })
        } catch {
          // Non-fatal
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Owner', value: 'owner' },
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Dealer', value: 'dealer' },
        { label: 'Shop', value: 'shop' },
        { label: 'Fleet Manager', value: 'fleet-manager' },
        { label: 'Staff', value: 'staff' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'defaultOrganization',
      type: 'relationship',
      relationTo: 'organizations',
      label: 'Default Organization',
      admin: {
        description:
          'Loaded automatically on login. Users can switch orgs in the portal.',
      },
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  timestamps: true,
}
