import type { CollectionConfig } from 'payload'

export const GeoPages: CollectionConfig = {
  slug: 'geo-pages',
  admin: {
    useAsTitle: 'city',
    group: 'Content',
    defaultColumns: ['city', 'state', 'slug', 'active'],
  },
  fields: [
    {
      name: 'city',
      type: 'text',
      required: true,
      label: 'City Name',
    },
    {
      name: 'state',
      type: 'text',
      required: true,
      defaultValue: 'MD',
      label: 'State',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: { description: 'e.g. rockville-md' },
    },
    {
      name: 'heroHeadline',
      type: 'text',
      label: 'Hero Headline',
      admin: { description: 'e.g. "Vehicle Upfitting in Rockville, MD"' },
    },
    {
      name: 'localIntro',
      type: 'textarea',
      label: 'Local Intro Paragraph',
      admin: { description: 'City-specific opening paragraph for SEO' },
    },
    {
      name: 'nearbyAreas',
      type: 'array',
      label: 'Nearby Areas (pill links)',
      fields: [
        { name: 'area', type: 'text' },
      ],
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      label: 'Featured Services',
    },
    {
      name: 'coordinates',
      type: 'group',
      label: 'Google Maps Coordinates',
      fields: [
        { name: 'lat', type: 'number', label: 'Latitude' },
        { name: 'lng', type: 'number', label: 'Longitude' },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'h1', type: 'text', label: 'H1 Override' },
        { name: 'keywords', type: 'text', label: 'Keywords (comma-separated)' },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
