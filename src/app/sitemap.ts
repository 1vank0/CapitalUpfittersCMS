import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://capitalupfitters.com'

// Static sitemap — does not require DB connection at build time
// Dynamic routes are included statically and will expand as CMS grows
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date(), priority: 1.0, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/start-here`, lastModified: new Date(), priority: 0.9, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/fleet`, lastModified: new Date(), priority: 0.9, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/dealer-government`, lastModified: new Date(), priority: 0.85, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/gallery`, lastModified: new Date(), priority: 0.8, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/quote`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/services`, lastModified: new Date(), priority: 0.85, changeFrequency: 'monthly' },
    // Service pages
    { url: `${BASE_URL}/services/bedliner`, lastModified: new Date(), priority: 0.85, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/services/ceramic-coating`, lastModified: new Date(), priority: 0.85, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/services/hitches`, lastModified: new Date(), priority: 0.85, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/services/undercoating`, lastModified: new Date(), priority: 0.85, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/services/tonneau`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/services/running-boards`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/services/commercial-wraps`, lastModified: new Date(), priority: 0.85, changeFrequency: 'monthly' },
    // Geo pages
    { url: `${BASE_URL}/locations/rockville-md`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/locations/bethesda-md`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/locations/silver-spring-md`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/locations/gaithersburg-md`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
  ]
}
