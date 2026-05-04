import type { CollectionConfig } from 'payload'
import { orgRelationship, defaultOrgOnCreate, orgReadAccess } from '../utils/orgScope'

/**
 * Leads — every form submission lands here. Public can create (forms),
 * authenticated org users read/update.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'refId',
    group: 'Operations',
    defaultColumns: ['refId', 'leadType', 'name', 'service', 'status', 'createdAt'],
    description: 'All inbound form submissions from capitalupfitters.com',
  },
  access: {
    create: () => true, // Public — forms POST here
    read: orgReadAccess,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [
      // refId generator (existing logic)
      ({ data }) => {
        if (!data.refId) {
          const prefix =
            data.leadType === 'fleet'
              ? 'FL'
              : data.leadType === 'dealer'
              ? 'DA'
              : data.leadType === 'commercial'
              ? 'CC'
              : 'CU'
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
          const rand = Math.floor(1000 + Math.random() * 9000)
          data.refId = `${prefix}-${date}-${rand}`
        }
        return data
      },
      // Org default: if no org set on a public submission, use the
      // organization configured in the Settings global.
      async ({ data, req, operation }) => {
        if (operation === 'create' && !data.organization) {
          if (req.user) {
            // Authenticated path
            const fromUser = (
              req.user as { defaultOrganization?: string | number }
            ).defaultOrganization
            if (fromUser) data.organization = fromUser
          }
          if (!data.organization) {
            // Public submission — fall back to first active org (Capital Upfitters)
            try {
              const orgs = await req.payload.find({
                collection: 'organizations',
                where: { status: { equals: 'active' } },
                limit: 1,
                sort: 'createdAt',
              })
              if (orgs.docs[0]) data.organization = orgs.docs[0].id
            } catch {
              // Non-fatal
            }
          }
        }
        return data
      },
      defaultOrgOnCreate,
    ],
  },
  fields: [
    orgRelationship,
    {
      name: 'refId',
      type: 'text',
      label: 'Reference ID',
      admin: { readOnly: true, description: 'Auto-generated: CU-20260324-1234' },
    },
    {
      name: 'leadType',
      type: 'select',
      required: true,
      label: 'Lead Type',
      options: [
        { label: 'Retail Quote', value: 'retail' },
        { label: 'Fleet Inquiry', value: 'fleet' },
        { label: 'Dealer Application', value: 'dealer' },
        { label: 'Commercial Consultation', value: 'commercial' },
        { label: 'Contact / Callback', value: 'contact' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      label: 'Status',
      options: [
        { label: '🆕 New', value: 'new' },
        { label: '📞 Contacted', value: 'contacted' },
        { label: '💬 Quoted', value: 'quoted' },
        { label: '📅 Scheduled', value: 'scheduled' },
        { label: '✅ Won', value: 'won' },
        { label: '❌ Lost', value: 'lost' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'phone', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', admin: { width: '50%' } },
        { name: 'company', type: 'text', label: 'Company / Fleet Name', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'service',
          type: 'select',
          label: 'Service Requested',
          admin: { width: '50%' },
          options: [
            { label: 'Patriot Liner / Bedliner', value: 'bedliner' },
            { label: 'Ceramic Coating', value: 'ceramic-coating' },
            { label: 'Hitch Installation', value: 'hitches' },
            { label: 'Undercoating', value: 'undercoating' },
            { label: 'Tonneau Cover', value: 'tonneau' },
            { label: 'Running Boards', value: 'running-boards' },
            { label: 'Commercial Wraps', value: 'commercial-wraps' },
            { label: 'Multiple / Bundle', value: 'bundle' },
            { label: 'Other', value: 'other' },
          ],
        },
        { name: 'vehicleYear', type: 'text', admin: { width: '25%' } },
        { name: 'vehicleMake', type: 'text', label: 'Make/Model', admin: { width: '25%' } },
      ],
    },
    { name: 'message', type: 'textarea', label: 'Message / Notes' },
    {
      name: 'fleetSize',
      type: 'number',
      label: 'Fleet Size (if fleet lead)',
      admin: {
        condition: (data) => data.leadType === 'fleet' || data.leadType === 'commercial',
      },
    },
    {
      name: 'source',
      type: 'select',
      label: 'Source Page',
      options: [
        { label: 'Homepage', value: 'home' },
        { label: 'Quote Form', value: 'quote' },
        { label: 'Fleet Page', value: 'fleet' },
        { label: 'Dealer Page', value: 'dealer' },
        { label: 'Commercial Coatings', value: 'commercial' },
        { label: 'Service Page', value: 'service' },
        { label: 'Geo / Location Page', value: 'geo' },
        { label: 'Contact Page', value: 'contact' },
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      label: 'Assigned To',
    },
    {
      name: 'followUpDate',
      type: 'date',
      label: 'Follow-Up Date',
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'notes',
      type: 'array',
      label: 'Internal Notes',
      admin: { description: 'Staff-only timeline of follow-ups.' },
      fields: [
        { name: 'note', type: 'textarea', required: true },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'createdAt',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
        },
      ],
    },
    {
      name: 'aiSummary',
      type: 'group',
      label: 'AI Enrichment',
      admin: { description: 'Auto-populated by AI intake pipeline (future).' },
      fields: [
        { name: 'priceEstimate', type: 'text' },
        { name: 'timelineEstimate', type: 'text' },
        { name: 'personalizedMessage', type: 'textarea' },
      ],
    },
  ],
  timestamps: true,
}
