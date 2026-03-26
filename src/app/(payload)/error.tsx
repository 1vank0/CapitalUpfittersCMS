'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[CMS Error Boundary]', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'monospace',
          padding: '2rem',
          background: '#111827',
          color: '#f87171',
          margin: 0,
        }}
      >
        <h2 style={{ color: '#f87171', marginTop: 0 }}>CMS Error</h2>
        <p>
          <strong>Message:</strong> {error.message || 'Unknown error'}
        </p>
        {error.digest && (
          <p>
            <strong>Digest:</strong> {error.digest}
          </p>
        )}
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            fontSize: '0.75rem',
            color: '#9ca3af',
            marginTop: '1rem',
            maxHeight: '300px',
            overflow: 'auto',
          }}
        >
          {error.stack}
        </pre>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={reset}
            style={{
              background: '#203055',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <a
            href="/admin/login"
            style={{
              color: '#60a5fa',
              textDecoration: 'none',
              padding: '0.5rem 0',
            }}
          >
            ← Back to login
          </a>
        </div>
      </body>
    </html>
  )
}
