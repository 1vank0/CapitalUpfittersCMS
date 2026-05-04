import type { CollectionConfig } from 'payload'
import { orgRelationship, defaultOrgOnCreate, orgReadAccess, orgWriteAccess } from '../utils/orgScope'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    group: 'Content',
    defaultColumns: ['question', 'service', 'audience', 'active'],
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
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'richText',
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
