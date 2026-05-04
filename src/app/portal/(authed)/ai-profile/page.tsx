import { requirePortalSession } from '@/lib/portalAuth'
import { PageHeader, Card, Button } from '../_components/ui'

export const dynamic = 'force-dynamic'

export default async function AIProfilePage() {
  const { payload } = await requirePortalSession()
  const profile = (await payload.findGlobal({ slug: 'ai-profile', depth: 0 })) as any

  return (
    <>
      <PageHeader
        title="AI Brand Profile"
        subtitle="Shape how the future AI layer writes, suggests, and generates for your brand."
        actions={
          <Button href="/admin/globals/ai-profile">Edit profile</Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-3">
            Brand voice
          </h2>
          <p className="text-sm text-[#374151] whitespace-pre-wrap">
            {profile?.brandVoice || '—'}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-3">
            Target audience
          </h2>
          <p className="text-sm text-[#374151] whitespace-pre-wrap">
            {profile?.targetAudience || '—'}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-3">
            Approved phrases
          </h2>
          <ul className="space-y-1 text-sm text-[#374151]">
            {(profile?.approvedPhrases || []).map((p: any, i: number) => (
              <li key={i}>· {p.phrase}</li>
            ))}
            {(!profile?.approvedPhrases || profile.approvedPhrases.length === 0) && (
              <li className="text-[#9ca3af]">None set</li>
            )}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-3">
            Do-not-say list
          </h2>
          <ul className="space-y-1 text-sm text-[#374151]">
            {(profile?.doNotSay || []).map((p: any, i: number) => (
              <li key={i}>✗ {p.phrase}</li>
            ))}
            {(!profile?.doNotSay || profile.doNotSay.length === 0) && (
              <li className="text-[#9ca3af]">None set</li>
            )}
          </ul>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6b7280] mb-3">
            Image generation style
          </h2>
          <p className="text-sm text-[#374151] whitespace-pre-wrap">
            {profile?.imageGenerationStyle || '—'}
          </p>
        </Card>
      </div>

      <p className="mt-8 text-xs text-[#9ca3af]">
        These settings are read by future AI generation endpoints (copy, image,
        captions). No AI features are wired today — schema only.
      </p>
    </>
  )
}
