import type { CollectionConfig } from 'payload'
import { orgRelationship, defaultOrgOnCreate, orgReadAccess, orgWriteAccess } from '../utils/orgScope'
import { seoFieldGroup } from '../utils/seoFields'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    description: 'Top-level pages: home, fleet, dealer-government, blog landings, custom landings.',
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
  versions: {
    drafts: {
      autosave: { interval: 2000 },
    },
    maxPerDoc: 25,
  },
  fields: [
    orgRelationship,
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
      index: true,
      admin: { description: 'e.g. "home", "fleet", "dealer-government"' },
    },
    {
      name: 'pageType',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Home', value: 'home' },
        { label: 'Audience Hub (Fleet / Dealer / Gov)', value: 'audience-hub' },
        { label: 'Service', value: 'service' },
        { label: 'Industrial', value: 'industrial' },
        { label: 'Landing / Campaign', value: 'landing' },
        { label: 'Blog Index', value: 'blog-index' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: '📝 Draft', value: 'draft' },
        { label: '✅ Published', value: 'published' },
        { label: '📦 Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    // ─── Hero ──────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Hero',
      fields: [
        { name: 'heroHeadline', type: 'text', label: 'Hero Headline' },
        { name: 'heroSubtext', type: 'textarea', label: 'Hero Subtext' },
        { name: 'heroImage', type: 'upload', relationTo: 'media', label: 'Hero Image' },
        {
          name: 'heroCTA',
          type: 'group',
          label: 'Hero CTA',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'url', type: 'text' },
          ],
        },
        {
          name: 'heroSecondaryCTA',
          type: 'group',
          label: 'Hero Secondary CTA',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'url', type: 'text' },
          ],
        },
      ],
    },
    // ─── Content sections (block builder) ──────────────────
    {
      name: 'sections',
      type: 'array',
      label: 'Page Sections',
      admin: { description: 'Build the page using reusable section blocks.' },
      fields: [
        {
          name: 'sectionType',
          type: 'select',
          required: true,
          options: [
            { label: 'Stats Strip', value: 'stats' },
            { label: 'Services Grid', value: 'services-grid' },
            { label: 'Why Choose Us', value: 'why' },
            { label: 'Testimonials', value: 'testimonials' },
            { label: 'CTA Banner', value: 'cta' },
            { label: 'FAQ', value: 'faq' },
            { label: 'Gallery', value: 'gallery' },
            { label: 'Comparison Table', value: 'comparison' },
            { label: 'Pricing Cards', value: 'pricing' },
            { label: 'Rich Text', value: 'richtext' },
            { label: 'Custom HTML', value: 'custom' },
            { label: 'Reusable Block', value: 'block-ref' },
          ],
        },
        { name: 'headline', type: 'text' },
        { name: 'subtext', type: 'textarea' },
        { name: 'richContent', type: 'richText' },
        {
          name: 'blockRef',
          type: 'relationship',
          relationTo: 'content-blocks',
          admin: { condition: (_, sib) => sib?.sectionType === 'block-ref' },
        },
        {
          name: 'customHTML',
          type: 'code',
          label: 'Custom HTML',
          admin: { language: 'html', condition: (_, sib) => sib?.sectionType === 'custom' },
        },
      ],
    },
    // ─── FAQ tied directly to page (not just relation) ────
    {
      name: 'faqItems',
      type: 'array',
      label: 'Page FAQ',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    // ─── Internal links ────────────────────────────────────
    {
      name: 'internalLinks',
      type: 'array',
      label: 'Internal Links (for SEO juice)',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    // ─── SEO ───────────────────────────────────────────────
    seoFieldGroup,
  ],
  timestamps: true,
}
