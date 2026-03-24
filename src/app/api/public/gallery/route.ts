import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const vehicleType = searchParams.get('vehicleType')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')

    const payload = await getPayload({ config })

    const where: Record<string, unknown> = { showInGallery: { equals: true } }
    if (category) where.category = { equals: category }
    if (vehicleType) where.vehicleType = { equals: vehicleType }
    if (featured === 'true') where.featured = { equals: true }

    const result = await payload.find({
      collection: 'media',
      where,
      limit,
      sort: '-createdAt',
    })

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
  }
}
