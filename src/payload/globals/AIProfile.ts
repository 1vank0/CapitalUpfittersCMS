import type { GlobalConfig } from 'payload'

/**
 * AIProfile — system prompt building blocks for the future AI layer.
 * Non-technical editors can shape brand voice, audience, do/don't lists,
 * and approved phrasing. Read by future AI generation endpoints.
 *
 * Currently a global (single per-deploy). When multi-tenant generation
 * matures, this will move to per-organization records.
 */
export const AIProfile: GlobalConfig = {
  slug: 'ai-profile',
  label: 'AI Brand Profile',
  admin: { group: 'Configuration' },
  fields: [
    {
      type: 'collapsible',
      label: 'Brand Voice',
      fields: [
        {
          name: 'brandVoice',
          type: 'textarea',
          label: 'Brand Voice',
          defaultValue:
            'Confident, family-owned, straight-talking. Prioritize clarity over cleverness. Speak like a trusted shop foreman: friendly, technical when needed, never salesy.',
        },
        {
          name: 'targetAudience',
          type: 'textarea',
          label: 'Target Audience',
          defaultValue:
            'Truck owners, fleet managers, dealers, and government procurement officers in the DMV (DC / Maryland / Virginia). Mix of consumers and commercial buyers.',
        },
        {
          name: 'tone',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Professional', value: 'professional' },
            { label: 'Friendly', value: 'friendly' },
            { label: 'Technical', value: 'technical' },
            { label: 'Confident', value: 'confident' },
            { label: 'Local / Regional', value: 'local' },
          ],
          defaultValue: ['professional', 'friendly', 'confident', 'local'],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Phrasing Rules',
      fields: [
        {
          name: 'doNotSay',
          type: 'array',
          label: 'Do-Not-Say List',
          admin: { description: 'Phrases the AI must never use.' },
          fields: [{ name: 'phrase', type: 'text' }],
        },
        {
          name: 'approvedPhrases',
          type: 'array',
          label: 'Approved Phrases',
          fields: [{ name: 'phrase', type: 'text' }],
        },
        {
          name: 'rejectedPhrases',
          type: 'array',
          label: 'Rejected Phrases (auto-replace)',
          fields: [
            { name: 'find', type: 'text' },
            { name: 'replaceWith', type: 'text' },
          ],
        },
        {
          name: 'preferredCta',
          type: 'text',
          label: 'Preferred CTA',
          defaultValue: 'Get a free quote',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Service & Geography',
      fields: [
        {
          name: 'mainServices',
          type: 'array',
          label: 'Main Services',
          fields: [{ name: 'service', type: 'text' }],
        },
        {
          name: 'targetCities',
          type: 'array',
          label: 'Target Cities',
          fields: [{ name: 'city', type: 'text' }],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Operations Rules',
      fields: [
        {
          name: 'warrantyRules',
          type: 'textarea',
          label: 'Warranty Rules',
          admin: { description: 'What can/cannot be claimed about warranty.' },
        },
        {
          name: 'pricingRules',
          type: 'textarea',
          label: 'Pricing Rules',
          admin: { description: 'How AI should talk about prices (ranges only? always quote-based?).' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Image / Media Style',
      fields: [
        {
          name: 'imageGenerationStyle',
          type: 'textarea',
          label: 'Image Generation Style',
          defaultValue:
            'High-quality automotive photography. Crisp lighting, clean shop background or outdoor on-location. No stock-photo gloss. Show real DMV-area trucks/vans.',
        },
        {
          name: 'captionExamples',
          type: 'array',
          label: 'Caption Examples',
          fields: [{ name: 'caption', type: 'text' }],
        },
      ],
    },
  ],
}
