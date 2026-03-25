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
  return RootLayout({
    children,
    config,
    importMap,
    serverFunction,
  })
}
