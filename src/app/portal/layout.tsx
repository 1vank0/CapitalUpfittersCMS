import type { Metadata } from 'next'
import './portal.css'

export const metadata: Metadata = {
  title: 'Upfit Portal',
  description: 'Operational control center for Capital Upfitters and the Upfit Portal network.',
}

/**
 * Root layout for the /portal route group. Intentionally minimal —
 * the actual chrome (sidebar, top bar) lives in (authed)/layout.tsx
 * so /portal/login can render full-screen without it.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className="portal-root">{children}</body>
    </html>
  )
}
