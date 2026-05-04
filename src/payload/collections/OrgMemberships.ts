import type { CollectionConfig } from 'payload'

/**
 * OrgMemberships — joins users ↔ organizations with a role per org.
 *
 * One user can belong to multiple orgs (e.g. a dealer who also runs a shop).
 * Roles are scoped per membership, not per user globally.
 */
export const OrgMemberships: CollectionConfig = {
  slug: 'org-memberships',
  admin: {
    useAsTitle: 'id',
    group: 'System',
    defaultColumns: ['user', 'organization', 'role', 'status'],
    description: 'Links users to organizations with a role.',
  },
  access: {
    create: ({ req }) => !!req.user,
    read: ({ req }) => !!req.user,
    update: ({ req }) =>
      req.user?.role === 'super-admin' ||
      req.user?.role === 'owner' ||
      req.user?.role === 'admin',
    delete: ({ req }) =>
      req.user?.role === 'super-admin' || req.user?.role === 'owner',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Owner', value: 'owner' },
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Dealer', value: 'dealer' },
        { label: 'Shop', value: 'shop' },
        { label: 'Fleet Manager', value: 'fleet-manager' },
        { label: 'Staff', value: 'staff' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Invited', value: 'invited' },
        { label: 'Suspended', value: 'suspended' },
      ],
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      label: 'Default org for this user',
      admin: { description: 'Loaded automatically when user logs in' },
    },
  ],
  timestamps: true,
}
