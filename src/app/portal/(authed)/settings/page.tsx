import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Card, Button } from '../_components/ui'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { payload } = await requirePortalSession()
  const settings = (await payload.findGlobal({ slug: 'settings', depth: 0 })) as any

  return (
    <>
      <PageHeader
        title="Business Settings"
        subtitle="Phone, hours, urgency banner, social, default SEO."
        actions={<Button href="/admin/globals/settings">Edit in admin</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-3">
            Contact
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Business name" value={settings?.businessName} />
            <Row label="Phone" value={settings?.contact?.phone} />
            <Row label="Email" value={settings?.contact?.email} />
            <Row label="Address" value={settings?.contact?.address} />
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-3">
            Hours
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Weekdays" value={settings?.hours?.weekdays} />
            <Row label="Saturday" value={settings?.hours?.saturday} />
            <Row label="Sunday" value={settings?.hours?.sunday} />
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-3">
            Urgency banner
          </h2>
          <dl className="space-y-2 text-sm">
            <Row
              label="Status"
              value={settings?.urgency?.enabled ? 'Enabled' : 'Disabled'}
            />
            <Row label="Message 1" value={settings?.urgency?.message1} />
            <Row label="Message 2" value={settings?.urgency?.message2} />
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-3">
            Upfit Portal
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Portal URL" value={settings?.portal?.url} />
            <Row label="Register URL" value={settings?.portal?.registerUrl} />
            <Row label="Login URL" value={settings?.portal?.loginUrl} />
          </dl>
        </Card>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[#6b7280]">{label}</dt>
      <dd className="text-[#111827] text-right">{value || <span className="text-[#9ca3af]">—</span>}</dd>
    </div>
  )
}
