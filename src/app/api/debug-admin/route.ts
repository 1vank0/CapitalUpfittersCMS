import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const errors: string[] = []
  const info: Record<string, unknown> = {}

  // Step 1: Try importing payload config
  try {
    const { default: configPromise } = await import('@payload-config')
    info.config_import = 'ok'

    // Step 2: Try building the config
    try {
      const config = await configPromise
      info.config_build = 'ok'
      info.collections = (config as any).collections?.map((c: any) => c.slug)
    } catch (err: unknown) {
      errors.push('config_build: ' + (err instanceof Error ? err.message + '\n' + err.stack : String(err)))
    }
  } catch (err: unknown) {
    errors.push('config_import: ' + (err instanceof Error ? err.message + '\n' + err.stack : String(err)))
  }

  // Step 3: Try initializing Payload
  try {
    const { getPayload } = await import('payload')
    const { default: configPromise } = await import('@payload-config')
    const payload = await getPayload({ config: configPromise })
    info.payload_init = 'ok'
    info.payload_version = (payload as any).version || 'unknown'
  } catch (err: unknown) {
    errors.push('payload_init: ' + (err instanceof Error ? err.message + '\n' + err.stack?.substring(0, 500) : String(err)))
  }

  return NextResponse.json({ info, errors }, { status: errors.length ? 500 : 200 })
}
