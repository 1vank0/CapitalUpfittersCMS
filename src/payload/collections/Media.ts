import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    group: 'Assets',
    defaultColumns: ['filename', 'alt', 'category', 'updatedAt'],
  },
  upload: {
    // staticDir removed — storage handled by R2 adapter in payload.config.ts
    // sharp handles all image resizing
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
      admin: { description: 'Describe the image for accessibility and SEO' },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Gallery Category',
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
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured in Gallery',
    },
    {
      name: 'showInGallery',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show in Public Gallery',
    },
  ],
  timestamps: true,
}
