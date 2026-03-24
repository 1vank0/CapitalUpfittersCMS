import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Business Settings',
  admin: {
    group: 'Configuration',
  },
  fields: [
    {
      name: 'businessName',
      type: 'text',
      defaultValue: 'Capital Upfitters',
      label: 'Business Name',
    },
    {
      type: 'group',
      name: 'contact',
      label: 'Contact Info',
      fields: [
        { name: 'phone', type: 'text', defaultValue: '(301) 555-0100' },
        { name: 'email', type: 'email' },
        { name: 'address', type: 'text', defaultValue: 'Rockville, MD' },
        { name: 'fullAddress', type: 'textarea', label: 'Full Street Address' },
      ],
    },
    {
      type: 'group',
      name: 'hours',
      label: 'Business Hours',
      fields: [
        { name: 'weekdays', type: 'text', defaultValue: 'Mon–Fri: 8am–5pm', label: 'Weekday Hours' },
        { name: 'saturday', type: 'text', defaultValue: 'Sat: 9am–2pm', label: 'Saturday Hours' },
        { name: 'sunday', type: 'text', defaultValue: 'Closed', label: 'Sunday Hours' },
      ],
    },
    {
      type: 'group',
      name: 'social',
      label: 'Social Media',
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook URL' },
        { name: 'instagram', type: 'text', label: 'Instagram URL' },
        { name: 'youtube', type: 'text', label: 'YouTube URL' },
        { name: 'google', type: 'text', label: 'Google Business URL' },
      ],
    },
    {
      type: 'group',
      name: 'seo',
      label: 'Default SEO',
      fields: [
        { name: 'defaultTitle', type: 'text', defaultValue: 'Capital Upfitters | Vehicle Upfitting Rockville MD' },
        { name: 'defaultDescription', type: 'textarea' },
        { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      type: 'group',
      name: 'urgency',
      label: 'Urgency Banner (CRO)',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Show Urgency Banner' },
        { name: 'message1', type: 'text', defaultValue: 'Same-week appointments available — call now', label: 'Message 1' },
        { name: 'message2', type: 'text', defaultValue: 'Fleet pricing available — no minimums', label: 'Message 2' },
      ],
    },
    {
      type: 'group',
      name: 'stats',
      label: 'Homepage Stats (e.g. 30+ Years)',
      fields: [
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'value', type: 'text', label: 'Stat Value (e.g. 30+)' },
            { name: 'label', type: 'text', label: 'Stat Label (e.g. Years Experience)' },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'portal',
      label: 'Upfit Portal',
      fields: [
        { name: 'url', type: 'text', defaultValue: 'https://upfit-portal-58190af9.base44.app', label: 'Portal URL' },
        { name: 'registerUrl', type: 'text', defaultValue: 'https://upfit-portal-58190af9.base44.app/DealerRegister', label: 'Register URL' },
        { name: 'loginUrl', type: 'text', defaultValue: 'https://upfit-portal-58190af9.base44.app/PortalChoice', label: 'Login URL' },
      ],
    },
  ],
}
