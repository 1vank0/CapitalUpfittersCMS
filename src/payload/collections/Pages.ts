import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'e.g. "home", "fleet", "dealer-government"',
      },
    },
    {
      name: 'heroHeadline',
      type: 'text',
      label: 'Hero Headline',
    },
    {
      name: 'heroSubtext',
      type: 'textarea',
      label: 'Hero Subtext',
    },
    {
      name: 'heroCTA',
      type: 'group',
      label: 'Hero CTA Button',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Page Sections',
      fields: [
        {
          name: 'sectionType',
          type: 'select',
          options: [
            { label: 'Stats Strip', value: 'stats' },
            { label: 'Services Grid', value: 'services-grid' },
            { label: 'Why Choose Us', value: 'why' },
            { label: 'Testimonials', value: 'testimonials' },
            { label: 'CTA Banner', value: 'cta' },
            { label: 'FAQ', value: 'faq' },
            { label: 'Gallery', value: 'gallery' },
            { label: 'Custom HTML', value: 'custom' },
          ],
        },
        { name: 'headline', type: 'text' },
        { name: 'subtext', type: 'textarea' },
        { name: 'customHTML', type: 'code', label: 'Custom HTML (advanced)' },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
  timestamps: true,
}
