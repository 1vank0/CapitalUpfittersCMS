import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { secret, email, password, name } = await request.json()

  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    // Check if any users exist already
    const existing = await payload.find({ collection: 'users', limit: 1 })
    
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name: name || 'Admin',
        role: 'admin',
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: `Admin user created: ${user.email}`,
      isFirst: existing.totalDocs === 0,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
