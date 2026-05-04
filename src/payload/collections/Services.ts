import type { CollectionConfig } from 'payload'
import { orgRelationship, defaultOrgOnCreate, orgReadAccess, orgWriteAccess } from '../utils/orgScope'
import { seoFieldGroup } from '../utils/seoFields'

/**
 * Services — full set of services Capital Upfitters offers, expandable
 * per-organization. Categories cover the 12 specified types.
 */
export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'category', 'priceFrom', 'active'],
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
    { name: 'name', type: 'text', required: true, label: 'Service Name' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'URL Slug',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Spray-In Bedliners', value: 'bedliners' },
        { label: 'Hitches & Towing', value: 'hitches' },
        { label: 'Undercoating & Rust Protection', value: 'undercoating' },
        { label: 'Ceramic Coating & PPF', value: 'ceramic-ppf' },
        { label: 'Truck Accessories', value: 'accessories' },
        { label: 'Tonneau Covers', value: 'tonneau' },
        { label: 'Running Boards & Steps', value: 'running-boards' },
        { label: 'Commercial Van Upfits', value: 'van-upfits' },
        { label: 'Fleet Upfitting', value: 'fleet' },
        { label: 'Dealer Services', value: 'dealer' },
        { label: 'Government / Municipal Services', value: 'government' },
        { label: 'Industrial Protective Coatings', value: 'industrial' },
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
      name: 'targetCustomers',
      type: 'array',
      label: 'Target Customer Profiles',
      fields: [{ name: 'profile', type: 'text' }],
    },
    {
      type: 'row',
      fields: [
        { name: 'priceFrom', type: 'number', label: 'Price From ($)', admin: { width: '50%' } },
        { name: 'priceTo', type: 'number', label: 'Price To ($)', admin: { width: '50%' } },
      ],
    },
    {
      name: 'priceLabel',
      type: 'text',
      label: 'Price Display Label',
      admin: { description: 'e.g. "Starting at $499" — overrides numeric range if set' },
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Short Tagline',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Short Description',
      admin: { description: 'For service cards and previews. 1–2 sentences.' },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Full Description',
    },
    {
      name: 'features',
      type: 'array',
      label: 'Feature Bullets',
      fields: [{ name: 'feature', type: 'text' }],
    },
    {
      name: 'popularAddOns',
      type: 'array',
      label: 'Popular Add-Ons',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'price', type: 'text' },
        { name: 'description', type: 'text' },
      ],
    },
    {
      name: 'warranty',
      type: 'text',
      label: 'Warranty Summary',
    },
    {
      name: 'warrantyNotes',
      type: 'textarea',
      label: 'Warranty Notes (full terms)',
    },
    {
      name: 'turnaround',
      type: 'text',
      label: 'Turnaround Time',
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
    },
    {
      name: 'galleryImages',
      type: 'array',
      label: 'Gallery Images',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'relatedServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      label: 'Related Services',
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Service CTA',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Get a Quote' },
        { name: 'url', type: 'text', defaultValue: '/quote.html' },
      ],
    },
    seoFieldGroup,
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active (visible on site)',
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 99,
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
