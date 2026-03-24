import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const audience = searchParams.get('audience')
    const serviceSlug = searchParams.get('service')

    const payload = await getPayload({ config })

    const where: Record<string, unknown> = { active: { equals: true } }
    if (audience) {
      where['or'] = [
        { audience: { contains: 'all' } },
        { audience: { contains: audience } },
      ]
    }

    const result = await payload.find({
      collection: 'faqs',
      where,
      sort: 'sortOrder',
      limit: 30,
      depth: 1,
    })

    // Filter by service slug if provided
    let docs = result.docs
    if (serviceSlug && docs) {
      docs = docs.filter((faq: Record<string, unknown>) => {
        const svc = faq.service as { slug?: string } | null
        return !svc || svc?.slug === serviceSlug
      })
    }

    return NextResponse.json({ ...result, docs }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}
