import type { Metadata } from 'next'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{
    segments: string[]
  }>
}

export const generateMetadata = async ({ params: paramsPromise }: Args): Promise<Metadata> => {
  const { segments } = await paramsPromise
  return generatePageMetadata({ config, params: { segments: segments ?? [] } })
}

const Page = async ({ params: paramsPromise }: Args) => {
  const { segments } = await paramsPromise
  return RootPage({ config, params: { segments: segments ?? [] } })
}

export default Page
