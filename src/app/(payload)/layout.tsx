import React from 'react'
import { RootLayout } from '@payloadcms/next/layouts'
import config from '@payload-config'
import './custom.css'

export const metadata = {
  title: 'Capital Upfitters CMS',
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return RootLayout({ config, children })
}
