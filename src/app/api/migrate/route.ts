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
    results.push('Payload initialized')

    // Try migrate first
    try {
      await payload.db.migrate()
      results.push('migrate() completed')
    } catch (migrateErr: unknown) {
      const msg = migrateErr instanceof Error ? migrateErr.message : String(migrateErr)
      results.push('migrate() error: ' + msg.substring(0, 200))

      // Try migrateFresh as fallback
      try {
        await (payload.db as any).migrateFresh({ forceAcceptWarning: true })
        results.push('migrateFresh() completed')
      } catch (freshErr: unknown) {
        const freshMsg = freshErr instanceof Error ? freshErr.message : String(freshErr)
        results.push('migrateFresh() error: ' + freshMsg.substring(0, 200))
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message, results }, { status: 500 })
  }
}
