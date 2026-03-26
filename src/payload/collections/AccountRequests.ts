import type { CollectionConfig } from 'payload'

export const AccountRequests: CollectionConfig = {
  slug: 'account-requests',
  admin: {
    useAsTitle: 'email',
    group: 'Configuration',
    defaultColumns: ['name', 'email', 'company', 'status', 'createdAt'],
  },
  access: {
    create: () => true, // public can submit requests
    read: ({ req }) => {
      if (req.user) return true
      return false
    },
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Full Name' },
    { name: 'email', type: 'email', required: true, label: 'Email Address' },
    { name: 'company', type: 'text', label: 'Company' },
    { name: 'reason', type: 'textarea', label: 'Reason for Access' },
    {
      name: 'requestedRole',
      type: 'select',
      label: 'Requested Role',
      defaultValue: 'editor',
      options: [
        { label: 'Editor', value: 'editor' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Denied', value: 'denied' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'adminNote',
      type: 'textarea',
      label: 'Admin Note',
      admin: { position: 'sidebar' },
    },
    {
      name: 'ipAddress',
      type: 'text',
      label: 'IP Address',
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}
