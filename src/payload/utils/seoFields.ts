import type { Field } from 'payload'

/**
 * Shared SEO field group — applied to Pages, Services, GeoPages.
 * Designed to power the SEO Manager's audit checks.
 */
export const seoFieldGroup: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: {
    description:
      'Search engine and social sharing fields. Watch the live audit warnings on the right.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Title',
          admin: {
            description: 'Recommended 50–60 characters. Shown on Google.',
            width: '70%',
          },
        },
        {
          name: 'h1',
          type: 'text',
          label: 'H1 Override',
          admin: { width: '30%' },
        },
      ],
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'Meta Description',
      admin: { description: 'Recommended 140–160 characters.' },
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      label: 'Canonical URL',
      admin: { description: 'Override the canonical URL if needed.' },
    },
    {
      type: 'collapsible',
      label: 'Open Graph (Social Sharing)',
      fields: [
        { name: 'ogTitle', type: 'text', label: 'OG Title' },
        { name: 'ogDescription', type: 'textarea', label: 'OG Description' },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'OG Image' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Schema (Structured Data)',
      fields: [
        {
          name: 'schemaType',
          type: 'select',
          defaultValue: 'WebPage',
          options: [
            { label: 'WebPage', value: 'WebPage' },
            { label: 'Service', value: 'Service' },
            { label: 'LocalBusiness', value: 'LocalBusiness' },
            { label: 'Article / Blog Post', value: 'Article' },
            { label: 'FAQPage', value: 'FAQPage' },
            { label: 'Product', value: 'Product' },
          ],
        },
        {
          name: 'schemaJsonLd',
          type: 'code',
          label: 'Custom JSON-LD (advanced)',
          admin: { language: 'json', description: 'Overrides auto-generated schema if set.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Indexing',
      fields: [
        {
          name: 'indexable',
          type: 'checkbox',
          defaultValue: true,
          label: 'Allow search engines to index this page',
        },
        {
          name: 'includeInSitemap',
          type: 'checkbox',
          defaultValue: true,
          label: 'Include in sitemap.xml',
        },
        {
          name: 'sitemapPriority',
          type: 'number',
          defaultValue: 0.7,
          min: 0,
          max: 1,
          admin: { description: '0.0 to 1.0 — homepage is usually 1.0' },
        },
        {
          name: 'changeFrequency',
          type: 'select',
          defaultValue: 'weekly',
          options: [
            { label: 'Always', value: 'always' },
            { label: 'Hourly', value: 'hourly' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' },
            { label: 'Never', value: 'never' },
          ],
        },
      ],
    },
    {
      name: 'keywords',
      type: 'text',
      label: 'Focus Keywords (comma-separated)',
    },
  ],
}
