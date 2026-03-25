import type { CollectionConfig } from 'payload'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    group: 'Content',
    defaultColumns: ['question', 'service', 'audience', 'active'],
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      label: 'Related Service (optional)',
    },
    {
      name: 'audience',
      type: 'select',
      hasMany: true,
      label: 'Show For Audience',
      options: [
        { label: 'All', value: 'all' },
        { label: 'Retail', value: 'retail' },
        { label: 'Fleet', value: 'fleet' },
        { label: 'Dealer', value: 'dealer' },
        { label: 'Government', value: 'government' },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 99,
      label: 'Sort Order',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
