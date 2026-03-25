import type { Metadata } from 'next'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'
import { importMap } from '../../importMap'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

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
    if (isRedirectError(err)) throw err

    const message = err instanceof Error ? err.message?.substring(0, 300) : String(err)
    // DrizzleQueryError wraps the real postgres error in .cause
    const cause = (err instanceof Error && (err as any).cause)
      ? String((err as any).cause?.message || (err as any).cause)
      : null
    const stack = err instanceof Error ? err.stack?.substring(0, 600) : ''

    console.error('[CMS] RootPage crash - message:', message, '- cause:', cause)

    return (
      <html>
        <body style={{ fontFamily: 'monospace', padding: '2rem', background: '#1a1a1a', color: '#ff6b6b' }}>
          <h2>CMS Admin Error</h2>
          <p><strong>Message:</strong> {message}</p>
          {cause && <p><strong>Root cause:</strong> {cause}</p>}
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: '#aaa' }}>{stack}</pre>
        </body>
      </html>
    )
  }
}
