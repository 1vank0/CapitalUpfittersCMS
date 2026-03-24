import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'customerName',
    group: 'Content',
    defaultColumns: ['customerName', 'service', 'rating', 'featured', 'active'],
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      required: true,
      label: 'Customer Name',
    },
    {
      name: 'customerTitle',
      type: 'text',
      label: 'Title / Company',
      admin: { description: 'e.g. "Fleet Manager, ABC Landscaping"' },
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      label: 'Review Quote',
    },
    {
      name: 'rating',
      type: 'select',
      options: [
        { label: '⭐⭐⭐⭐⭐ 5 Stars', value: '5' },
        { label: '⭐⭐⭐⭐ 4 Stars', value: '4' },
        { label: '⭐⭐⭐ 3 Stars', value: '3' },
      ],
      defaultValue: '5',
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      label: 'Related Service',
    },
    {
      name: 'audience',
      type: 'select',
      label: 'Customer Type',
      options: [
        { label: 'Retail Customer', value: 'retail' },
        { label: 'Fleet Client', value: 'fleet' },
        { label: 'Dealer Partner', value: 'dealer' },
        { label: 'Government / Municipal', value: 'government' },
      ],
    },
    {
      name: 'source',
      type: 'select',
      label: 'Review Source',
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Yelp', value: 'yelp' },
        { label: 'Direct', value: 'direct' },
      ],
    },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'Source URL',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured (homepage)',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
    },
  ],
  timestamps: true,
}
