import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    const payload = await getPayload({ config })
    results.push('Payload initialized with: ' + (process.env.DATABASE_URL || 'no DATABASE_URL').replace(/:([^@]+)@/, ':***@').substring(0, 60))

    await payload.db.migrate()
    results.push('migrate() completed successfully')

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    results.push('ERROR: ' + message.substring(0, 300))
    return NextResponse.json({ success: false, results, error: message }, { status: 500 })
  }
}
