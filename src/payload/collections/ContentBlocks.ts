import type { CollectionConfig } from 'payload'
import { orgRelationship, defaultOrgOnCreate, orgReadAccess, orgWriteAccess } from '../utils/orgScope'

/**
 * ContentBlocks — reusable, named blocks that can be referenced from any
 * page section. Lets non-technical editors maintain "Why Choose Us",
 * standard CTAs, common FAQs, etc., once and reuse everywhere.
 */
export const ContentBlocks: CollectionConfig = {
  slug: 'content-blocks',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'blockType', 'updatedAt'],
    description: 'Reusable content blocks: heroes, CTAs, FAQs, galleries, comparisons, pricing.',
  },
  access: {
    create: orgWriteAccess,
    read: orgReadAccess,
    update: orgWriteAccess,
    delete: orgWriteAccess,
  },
  hooks: {
    beforeChange: [defaultOrgOnCreate],
  },
  fields: [
    orgRelationship,
    { name: 'name', type: 'text', required: true, label: 'Internal Name' },
    {
      name: 'blockType',
      type: 'select',
      required: true,
      options: [
        { label: 'Hero', value: 'hero' },
        { label: 'Service Card', value: 'service-card' },
        { label: 'CTA Banner', value: 'cta' },
        { label: 'FAQ', value: 'faq' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Review / Testimonial', value: 'review' },
        { label: 'Location', value: 'location' },
        { label: 'Comparison Table', value: 'comparison' },
        { label: 'Pricing Cards', value: 'pricing' },
      ],
    },
    { name: 'headline', type: 'text' },
    { name: 'subtext', type: 'textarea' },
    { name: 'body', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: 'Items (rows / cards / FAQ items)',
      admin: { description: 'For lists, comparison rows, pricing tiers, FAQ items, etc.' },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'subtitle', type: 'text' },
        { name: 'body', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'price', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'meta',
      type: 'json',
      label: 'Custom Data (advanced)',
      admin: { description: 'Free-form JSON for block-specific config.' },
    },
  ],
  timestamps: true,
}
