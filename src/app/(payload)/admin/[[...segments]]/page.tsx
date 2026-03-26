import type { Metadata } from 'next'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'
import { importMap } from '../../importMap'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Tell Next.js not to cache this page at all
export const fetchCache = 'force-no-store'
export const revalidate = 0

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  try {
    return await generatePageMetadata({ config, params, searchParams })
  } catch (err) {
    if (isRedirectError(err)) throw err
    return { title: 'Capital Upfitters CMS' }
  }
}

export default async function Page({ params, searchParams }: Args) {
  try {
    return await RootPage({ config, importMap, params, searchParams })
  } catch (err: unknown) {
    // Re-throw redirects — Next.js must handle these
    if (isRedirectError(err)) throw err

    const message = err instanceof Error ? err.message?.substring(0, 400) : String(err)
    const cause = (err instanceof Error && (err as any).cause)
      ? String((err as any).cause?.message || (err as any).cause).substring(0, 400)
      : null
    const stack = err instanceof Error ? err.stack?.substring(0, 800) : ''

    console.error('[CMS Page] crash:', message, '| cause:', cause)

    return (
      <html lang="en">
        <body style={{ fontFamily: 'monospace', padding: '2rem', background: '#111827', color: '#f87171' }}>
          <h2>CMS Error</h2>
          <p><strong>Message:</strong> {message}</p>
          {cause && <p><strong>Root cause:</strong> {cause}</p>}
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: '#9ca3af' }}>{stack}</pre>
          <p style={{ marginTop: '2rem' }}>
            <a href="/admin/login" style={{ color: '#60a5fa' }}>← Back to login</a>
          </p>
        </body>
      </html>
    )
  }
}
