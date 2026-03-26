import React from 'react'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import config from '@payload-config'
import { importMap } from './importMap'
import './custom.css'

export const metadata = {
  title: 'Capital Upfitters CMS',
  description: 'Operational control center — capitalupfitters.com',
}

const serverFunction: typeof handleServerFunctions = async (args) => {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  try {
    return await RootLayout({
      children,
      config,
      importMap,
      serverFunction,
    })
  } catch (err: unknown) {
    // Capture and surface the real error instead of generic "Application error"
    const message = err instanceof Error ? err.message : String(err)
    const cause = (err instanceof Error && (err as any).cause)
      ? String((err as any).cause?.message || (err as any).cause).substring(0, 400)
      : null
    const stack = err instanceof Error ? (err.stack || '').substring(0, 800) : ''

    console.error('[CMS Layout] crash:', message, cause)

    return (
      <html lang="en">
        <body style={{ fontFamily: 'monospace', padding: '2rem', background: '#111827', color: '#f87171' }}>
          <h2 style={{ color: '#f87171' }}>CMS Layout Error</h2>
          <p><strong>Message:</strong> {message}</p>
          {cause && <p><strong>Root cause:</strong> {cause}</p>}
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: '#9ca3af', marginTop: '1rem' }}>{stack}</pre>
          <p style={{ marginTop: '2rem', color: '#6b7280', fontSize: '0.875rem' }}>
            <a href="/admin/login" style={{ color: '#60a5fa' }}>← Back to login</a>
          </p>
        </body>
      </html>
    )
  }
}
