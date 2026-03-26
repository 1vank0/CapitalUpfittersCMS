import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = key.toLowerCase().includes('cookie') ? value.substring(0, 40) + '...' : value
  })
  return NextResponse.json({ headers })
}
