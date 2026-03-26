import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    results.push('1. Initializing Payload...')
    const payload = await getPayload({ config })
    results.push('2. Payload initialized OK')

    // Test all collections
    for (const slug of ['users', 'services', 'leads', 'account-requests', 'media', 'pages', 'geo-pages', 'testimonials', 'faqs', 'tags', 'quotes']) {
      try {
        const r = await payload.find({ collection: slug as any, limit: 1, overrideAccess: true })
        results.push(`  ${slug}: OK (${r.totalDocs} docs)`)
      } catch (e: unknown) {
        results.push(`  ${slug}: ERROR — ${String(e).substring(0, 200)}`)
      }
    }

    // Test globals
    try {
      await payload.findGlobal({ slug: 'settings', overrideAccess: true })
      results.push('  settings global: OK')
    } catch (e: unknown) {
      results.push(`  settings global: ERROR — ${String(e).substring(0, 200)}`)
    }

    return NextResponse.json({ ok: true, results })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const cause = (err as any)?.cause ? String((err as any).cause).substring(0, 300) : null
    const stack = err instanceof Error ? (err.stack || '').substring(0, 500) : ''
    results.push(`FATAL: ${msg.substring(0, 300)}`)
    if (cause) results.push(`CAUSE: ${cause}`)
    return NextResponse.json({ ok: false, results, error: msg, stack }, { status: 500 })
  }
}
