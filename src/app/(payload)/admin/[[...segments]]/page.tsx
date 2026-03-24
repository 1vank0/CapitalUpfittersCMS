import type { Metadata } from 'next'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export const generateMetadata = ({ params }: { params: { segments: string[] } }): Promise<Metadata> =>
  generatePageMetadata({ config, params: { segments: params.segments ?? [] } })

const Page = ({ params }: { params: { segments: string[] } }) =>
  RootPage({ config, params: { segments: params.segments ?? [] } })

export default Page
