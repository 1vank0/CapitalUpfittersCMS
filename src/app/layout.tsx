import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Capital Upfitters CMS',
  description: 'Operational control center for capitalupfitters.com',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
