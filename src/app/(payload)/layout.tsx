import React from 'react'
import { RootLayout } from '@payloadcms/next/layouts'
import config from '@payload-config'
import './custom.scss'

export const metadata = {
  title: 'Capital Upfitters CMS',
}

const Layout = ({ children }: { children: React.ReactNode }) =>
  RootLayout({ config, children })

export default Layout
