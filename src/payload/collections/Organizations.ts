import type { CollectionConfig } from 'payload'

/**
 * Organizations — multi-tenancy backbone for Upfit Portal.
 *
 * Capital Upfitters is org #1. Future shop owners, dealers, and fleet
 * clients each get their own organization. All content collections
 * (Pages, Services, Locations, Media, Leads, etc.) are scoped to an org.
 */
export const Organizations: CollectionConfig = {
  slug: 'organizations',
  admin: {
    useAsTitle: 'name',
    group: 'System',
    defaultColumns: ['name', 'slug', 'plan', 'status', 'createdAt'],
    description: 'Tenants of the Upfit Portal. Capital Upfitters is the first.',
  },
  access: {
    // Only authenticated users can interact; further filtering via memberships.
    create: ({ req }) => req.user?.role === 'super-admin' || req.user?.role === 'owner',
    read: ({ req }) => !!req.user,
    update: ({ req }) =>
      req.user?.role === 'super-admin' ||
      req.user?.role === 'owner' ||
      req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Organization Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: { description: 'e.g. capital-upfitters' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'shop',
      options: [
        { label: 'Upfitting Shop', value: 'shop' },
        { label: 'Dealer', value: 'dealer' },
        { label: 'Fleet Operator', value: 'fleet' },
        { label: 'Government / Municipal', value: 'government' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Trial', value: 'trial' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'plan',
      type: 'select',
      defaultValue: 'starter',
      options: [
        { label: 'Starter', value: 'starter' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' },
        { label: 'Internal', value: 'internal' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'group',
      name: 'contact',
      label: 'Contact Info',
      fields: [
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'address', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'zip', type: 'text' },
      ],
    },
    {
      type: 'group',
      name: 'branding',
      label: 'Branding',
      fields: [
        { name: 'primaryColor', type: 'text', defaultValue: '#203055' },
        { name: 'logo', type: 'upload', relationTo: 'media' },
        { name: 'tagline', type: 'text' },
      ],
    },
    {
      name: 'primaryDomain',
      type: 'text',
      label: 'Primary Public Domain',
      admin: { description: 'e.g. capitalupfitters.com' },
    },
  ],
  timestamps: true,
}
