import { NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'

/**
 * Public read endpoint for location pages. Used by the static site to
 * render city pages dynamically.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    const payload = await getPayload({ config })

    const where: Where = { active: { equals: true } }
    if (slug) where.slug = { equals: slug }

    const result = await payload.find({
      collection: 'geo-pages',
      where,
      depth: 1,
      limit: 50,
    })

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}
