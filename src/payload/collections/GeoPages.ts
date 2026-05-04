import type { CollectionConfig } from 'payload'
import { orgRelationship, defaultOrgOnCreate, orgReadAccess, orgWriteAccess } from '../utils/orgScope'
import { seoFieldGroup } from '../utils/seoFields'

/**
 * Locations — geo / city pages. Slug stays "geo-pages" for backward
 * compatibility with the static site's existing API client.
 * Admin UI labels everything as "Locations".
 */
export const GeoPages: CollectionConfig = {
  slug: 'geo-pages',
  labels: {
    singular: 'Location',
    plural: 'Locations',
  },
  admin: {
    useAsTitle: 'city',
    group: 'Content',
    defaultColumns: ['city', 'state', 'slug', 'active'],
    description: 'City / region pages for local SEO.',
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
    { name: 'city', type: 'text', required: true, label: 'City Name' },
    { name: 'county', type: 'text', label: 'County' },
    { name: 'state', type: 'text', required: true, defaultValue: 'MD', label: 'State' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'URL Slug',
      admin: { description: 'e.g. rockville-md' },
    },
    {
      name: 'heroHeadline',
      type: 'text',
      label: 'Hero Headline',
    },
    {
      name: 'localIntro',
      type: 'textarea',
      label: 'Local Intro Paragraph',
      admin: { description: 'City-specific opening paragraph for SEO' },
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      label: 'Services Offered in This City',
    },
    {
      name: 'nearbyAreas',
      type: 'array',
      label: 'Nearby Areas (pill links)',
      fields: [{ name: 'area', type: 'text' }],
    },
    {
      name: 'localProof',
      type: 'array',
      label: 'Local Proof / Examples',
      admin: { description: 'Local job examples, customer counts, neighborhoods served' },
      fields: [
        { name: 'headline', type: 'text' },
        { name: 'detail', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'faqItems',
      type: 'array',
      label: 'Local FAQ',
      fields: [
        { name: 'question', type: 'text' },
        { name: 'answer', type: 'textarea' },
      ],
    },
    {
      name: 'internalLinks',
      type: 'array',
      label: 'Internal Links',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'coordinates',
      type: 'group',
      label: 'Google Maps Coordinates',
      fields: [
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
      ],
    },
    seoFieldGroup,
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
