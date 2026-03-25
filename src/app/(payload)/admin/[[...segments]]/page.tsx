import type { Metadata } from 'next'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'
import { importMap } from '../../importMap'

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
    console.error('[CMS] generatePageMetadata error:', err)
    return { title: 'Capital Upfitters CMS' }
  }
}

export default async function Page({ params, searchParams }: Args) {
  try {
    return await RootPage({ config, importMap, params, searchParams })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : ''
    console.error('[CMS] RootPage crash:', message, stack)

    // Return visible error in production so we can diagnose
    return (
      <html>
        <body style={{ fontFamily: 'monospace', padding: '2rem', background: '#1a1a1a', color: '#ff6b6b' }}>
          <h2>CMS Admin Error</h2>
          <p><strong>Message:</strong> {message}</p>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: '#aaa' }}>{stack}</pre>
        </body>
      </html>
    )
  }
}
