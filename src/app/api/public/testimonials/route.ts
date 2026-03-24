import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const audience = searchParams.get('audience')

    const payload = await getPayload({ config })

    const where: Record<string, unknown> = { active: { equals: true } }
    if (featured === 'true') where.featured = { equals: true }
    if (audience) where.audience = { equals: audience }

    const result = await payload.find({
      collection: 'testimonials',
      where,
      limit: 20,
    })

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}
