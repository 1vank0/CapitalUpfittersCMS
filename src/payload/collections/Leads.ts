import type { CollectionConfig } from 'payload'

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
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.refId) {
          const prefix = data.leadType === 'fleet' ? 'FL' : data.leadType === 'dealer' ? 'DA' : data.leadType === 'commercial' ? 'CC' : 'CU'
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
          const rand = Math.floor(1000 + Math.random() * 9000)
          data.refId = `${prefix}-${date}-${rand}`
        }
        return data
      },
    ],
  },
  fields: [
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
        { label: '💬 In Discussion', value: 'in-discussion' },
        { label: '✅ Booked', value: 'booked' },
        { label: '❌ Lost', value: 'lost' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Name', admin: { width: '50%' } },
        { name: 'phone', type: 'text', label: 'Phone', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', label: 'Email', admin: { width: '50%' } },
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
        { name: 'vehicleYear', type: 'text', label: 'Vehicle Year', admin: { width: '25%' } },
        { name: 'vehicleMake', type: 'text', label: 'Make/Model', admin: { width: '25%' } },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message / Notes',
    },
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
      name: 'internalNotes',
      type: 'textarea',
      label: 'Internal Notes (not visible to customer)',
      admin: { description: 'Staff only — add follow-up notes, quotes given, appointment details' },
    },
    {
      name: 'assignedTo',
      type: 'text',
      label: 'Assigned To',
    },
    {
      name: 'followUpDate',
      type: 'date',
      label: 'Follow-Up Date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'aiSummary',
      type: 'group',
      label: 'AI Enrichment',
      admin: { description: 'Auto-populated by AI intake pipeline' },
      fields: [
        { name: 'priceEstimate', type: 'text', label: 'Price Estimate' },
        { name: 'timelineEstimate', type: 'text', label: 'Timeline Estimate' },
        { name: 'personalizedMessage', type: 'textarea', label: 'Personalized Message Draft' },
      ],
    },
  ],
  timestamps: true,
}
