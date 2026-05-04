import type { CollectionConfig } from 'payload'
import { orgRelationship, defaultOrgOnCreate, orgReadAccess, orgWriteAccess } from '../utils/orgScope'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    group: 'Assets',
    defaultColumns: ['filename', 'alt', 'category', 'updatedAt'],
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
  upload: {
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [
    orgRelationship,
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
      admin: { description: 'Describe the image for accessibility and SEO' },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Display Title',
    },
    {
      name: 'category',
      type: 'select',
      label: 'Service Category',
      options: [
        { label: 'Bedliner / Patriot Liner', value: 'bedliner' },
        { label: 'Ceramic Coating', value: 'ceramic' },
        { label: 'Hitches', value: 'hitch' },
        { label: 'Undercoating', value: 'undercoating' },
        { label: 'Fleet', value: 'fleet' },
        { label: 'Accessories', value: 'accessories' },
        { label: 'Wraps & Graphics', value: 'wraps' },
        { label: 'Running Boards', value: 'running-boards' },
        { label: 'Tonneau Covers', value: 'tonneau' },
        { label: 'Industrial Coatings', value: 'industrial' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'vehicleType',
      type: 'select',
      label: 'Vehicle Type',
      options: [
        { label: 'Pickup Truck', value: 'truck' },
        { label: 'SUV', value: 'suv' },
        { label: 'Van / Sprinter', value: 'van' },
        { label: 'Fleet Vehicle', value: 'fleet' },
        { label: 'Government', value: 'government' },
        { label: 'Industrial Equipment', value: 'industrial' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'geo-pages',
      label: 'Location (optional)',
    },
    {
      name: 'beforeAfter',
      type: 'select',
      label: 'Before / After Tag',
      options: [
        { label: 'N/A', value: 'na' },
        { label: 'Before', value: 'before' },
        { label: 'After', value: 'after' },
        { label: 'Process', value: 'process' },
      ],
      defaultValue: 'na',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured in Gallery',
      admin: { position: 'sidebar' },
    },
    {
      name: 'showInGallery',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show in Public Gallery',
      admin: { position: 'sidebar' },
    },
    // ─── AI-ready fields (populated later by image-analysis pipeline) ───
    {
      type: 'collapsible',
      label: 'AI Enrichment',
      admin: { description: 'Auto-populated by future AI image analysis pipeline.' },
      fields: [
        {
          name: 'aiDescription',
          type: 'textarea',
          label: 'AI-Generated Description',
          admin: { readOnly: true },
        },
        {
          name: 'aiDetectedObjects',
          type: 'array',
          label: 'Detected Objects',
          admin: { readOnly: true },
          fields: [{ name: 'object', type: 'text' }],
        },
        {
          name: 'aiSuggestedAlt',
          type: 'text',
          label: 'AI-Suggested Alt Text',
          admin: { readOnly: true },
        },
        {
          name: 'aiAnalyzedAt',
          type: 'date',
          admin: { readOnly: true },
        },
      ],
    },
  ],
  timestamps: true,
}
