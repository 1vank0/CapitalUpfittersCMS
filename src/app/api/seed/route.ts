/**
 * Server-side seed endpoint — runs the Upfit Portal seed against the live DB.
 *
 * Idempotent (existing rows are skipped). Authenticated via PAYLOAD_SECRET.
 *
 *   curl "https://capital-upfitters-cms.vercel.app/api/seed?secret=$SECRET&owner_email=...&owner_password=..."
 *
 * Owner email / password may be provided as query params for one-off use, or
 * via SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD env vars (preferred).
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seed } from '@/payload/seed/seed'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Allow per-call override of owner credentials
  const ownerEmail = searchParams.get('owner_email')
  const ownerPassword = searchParams.get('owner_password')
  const ownerName = searchParams.get('owner_name')
  if (ownerEmail) process.env.SEED_OWNER_EMAIL = ownerEmail
  if (ownerPassword) process.env.SEED_OWNER_PASSWORD = ownerPassword
  if (ownerName) process.env.SEED_OWNER_NAME = ownerName

  // Capture seed log lines
  const lines: string[] = []
  try {
    const payload = await getPayload({ config })
    const origInfo = payload.logger.info.bind(payload.logger)
    const origWarn = payload.logger.warn.bind(payload.logger)
    payload.logger.info = ((msg: unknown, ...rest: unknown[]) => {
      lines.push(String(msg))
      return origInfo(msg as never, ...(rest as never[]))
    }) as typeof payload.logger.info
    payload.logger.warn = ((msg: unknown, ...rest: unknown[]) => {
      lines.push(`WARN ${String(msg)}`)
      return origWarn(msg as never, ...(rest as never[]))
    }) as typeof payload.logger.warn

    await seed(payload)
    return NextResponse.json({ success: true, log: lines })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, log: lines, error: msg }, { status: 500 })
  }
}
