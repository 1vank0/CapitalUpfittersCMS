import type { CollectionConfig } from 'payload'

export const Quotes: CollectionConfig = {
  slug: 'quotes',
  admin: {
    useAsTitle: 'refId',
    group: 'Operations',
    defaultColumns: ['refId', 'status', 'service', 'totalEstimate', 'createdAt'],
    description: 'Generated quotes tied to leads',
  },
  access: {
    create: ({ req }) => !!req.user,
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'refId',
      type: 'text',
      label: 'Quote ID',
      admin: { readOnly: true },
    },
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      label: 'Related Lead',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: '📝 Draft', value: 'draft' },
        { label: '📤 Sent', value: 'sent' },
        { label: '✅ Accepted', value: 'accepted' },
        { label: '❌ Declined', value: 'declined' },
        { label: '⌛ Expired', value: 'expired' },
      ],
    },
    {
      name: 'lineItems',
      type: 'array',
      label: 'Line Items',
      fields: [
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services',
        },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'number', label: 'Price ($)' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', type: 'number', label: 'Subtotal ($)', admin: { width: '33%' } },
        { name: 'discount', type: 'number', label: 'Discount ($)', admin: { width: '33%' } },
        { name: 'totalEstimate', type: 'number', label: 'Total ($)', admin: { width: '33%' } },
      ],
    },
    {
      name: 'validUntil',
      type: 'date',
      label: 'Valid Until',
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Quote Notes',
    },
  ],
  timestamps: true,
}
