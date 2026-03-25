import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'category', 'priceFrom', 'active'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Service Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        description: 'e.g. bedliner, ceramic-coating, hitches',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Protective Coatings', value: 'coatings' },
        { label: 'Towing & Hitches', value: 'hitches' },
        { label: 'Accessories', value: 'accessories' },
        { label: 'Fleet & Commercial', value: 'fleet' },
        { label: 'Wraps & Graphics', value: 'wraps' },
      ],
    },
    {
      name: 'audience',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Retail', value: 'retail' },
        { label: 'Fleet', value: 'fleet' },
        { label: 'Government', value: 'government' },
        { label: 'Dealer', value: 'dealer' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'priceFrom',
          type: 'number',
          label: 'Price From ($)',
          admin: { width: '50%' },
        },
        {
          name: 'priceTo',
          type: 'number',
          label: 'Price To ($)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'priceLabel',
      type: 'text',
      label: 'Price Display Label',
      admin: {
        description: 'e.g. "Starting at $499" — overrides numeric price if set',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Short Tagline',
      admin: { description: 'One-line pitch shown on cards and hero' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Full Description',
    },
    {
      name: 'features',
      type: 'array',
      label: 'Feature Bullets',
      fields: [
        {
          name: 'feature',
          type: 'text',
        },
      ],
    },
    {
      name: 'faqItems',
      type: 'array',
      label: 'FAQ Items',
      fields: [
        { name: 'question', type: 'text' },
        { name: 'answer', type: 'textarea' },
      ],
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Image',
    },
    {
      name: 'galleryImages',
      type: 'array',
      label: 'Gallery Images',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
    {
      name: 'turnaround',
      type: 'text',
      label: 'Turnaround Time',
      admin: { description: 'e.g. "Same day" or "1–2 business days"' },
    },
    {
      name: 'warranty',
      type: 'text',
      label: 'Warranty',
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text', label: 'Meta Title' },
        { name: 'metaDescription', type: 'textarea', label: 'Meta Description' },
        { name: 'keywords', type: 'text', label: 'Keywords (comma-separated)' },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active (visible on site)',
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 99,
    },
  ],
  timestamps: true,
}
