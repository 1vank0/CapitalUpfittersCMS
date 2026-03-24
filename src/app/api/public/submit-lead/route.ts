import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      leadType = 'retail',
      name,
      email,
      phone,
      company,
      service,
      vehicleYear,
      vehicleMake,
      message,
      fleetSize,
      source,
    } = body

    // Require at minimum a name and contact method
    if (!name || (!email && !phone)) {
      return NextResponse.json(
        { error: 'Name and at least one contact method (email or phone) are required.' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    const lead = await payload.create({
      collection: 'leads',
      data: {
        leadType,
        name,
        email,
        phone,
        company,
        service,
        vehicleYear,
        vehicleMake,
        message,
        fleetSize,
        source,
        status: 'new',
      },
    })

    return NextResponse.json(
      { success: true, refId: lead.refId, message: `Your quote request (${lead.refId}) has been received. We'll be in touch within 4 hours.` },
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Lead submission error:', error)
    return NextResponse.json(
      { error: 'Submission failed. Please call us directly or email.' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}
