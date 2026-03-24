import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://capitalupfitters.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const payload = await getPayload({ config })

    // Static core pages
    const staticPages: MetadataRoute.Sitemap = [
      { url: BASE_URL, lastModified: new Date(), priority: 1.0, changeFrequency: 'weekly' },
      { url: `${BASE_URL}/start-here`, lastModified: new Date(), priority: 0.9, changeFrequency: 'monthly' },
      { url: `${BASE_URL}/fleet`, lastModified: new Date(), priority: 0.9, changeFrequency: 'monthly' },
      { url: `${BASE_URL}/dealer-government`, lastModified: new Date(), priority: 0.85, changeFrequency: 'monthly' },
      { url: `${BASE_URL}/gallery`, lastModified: new Date(), priority: 0.8, changeFrequency: 'weekly' },
      { url: `${BASE_URL}/quote`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
      { url: `${BASE_URL}/contact`, lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' },
      { url: `${BASE_URL}/services`, lastModified: new Date(), priority: 0.85, changeFrequency: 'monthly' },
    ]

    // Dynamic service pages
    const servicesResult = await payload.find({
      collection: 'services',
      where: { active: { equals: true } },
      limit: 50,
    })
    const servicePages: MetadataRoute.Sitemap = servicesResult.docs.map((service) => ({
      url: `${BASE_URL}/services/${service.slug}`,
      lastModified: new Date(service.updatedAt as string),
      priority: 0.85,
      changeFrequency: 'monthly' as const,
    }))

    // Dynamic geo pages
    const geoResult = await payload.find({
      collection: 'geo-pages',
      where: { active: { equals: true } },
      limit: 20,
    })
    const geoPages: MetadataRoute.Sitemap = geoResult.docs.map((geo) => ({
      url: `${BASE_URL}/locations/${geo.slug}`,
      lastModified: new Date(geo.updatedAt as string),
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    }))

    return [...staticPages, ...servicePages, ...geoPages]
  } catch {
    // Fallback static sitemap if DB unavailable
    return [
      { url: BASE_URL, lastModified: new Date(), priority: 1.0 },
    ]
  }
}
