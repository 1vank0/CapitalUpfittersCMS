import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    const payload = await getPayload({ config })

    const where: Record<string, unknown> = { active: { equals: true } }
    if (slug) where.slug = { equals: slug }

    const result = await payload.find({
      collection: 'geo-pages',
      where,
      depth: 2,
      limit: 20,
    })

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch geo pages' }, { status: 500 })
  }
}
