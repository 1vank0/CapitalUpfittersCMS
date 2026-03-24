import { NotFoundPage } from '@payloadcms/next/views'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export default async function NotFound() {
  return NotFoundPage({ config })
}
