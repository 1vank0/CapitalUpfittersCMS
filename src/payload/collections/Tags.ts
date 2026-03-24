import type { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Service Tag', value: 'service' },
        { label: 'Vehicle Tag', value: 'vehicle' },
        { label: 'Industry Tag', value: 'industry' },
        { label: 'Location Tag', value: 'location' },
      ],
    },
  ],
  timestamps: true,
}
