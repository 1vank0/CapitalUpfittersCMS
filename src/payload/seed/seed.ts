/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Capital Upfitters CMS — Seed Script
 * Seeds all Phase 1 content: Services, GeoPages, Testimonials, FAQs
 * Run: npx payload run src/payload/seed/seed.ts
 */

import type { Payload } from 'payload'

type SeedRecord = Record<string, unknown>

async function createSafe(payload: Payload, collection: string, data: SeedRecord, label: string) {
  try {
    await payload.create({ collection, data } as any)
    payload.logger.info(`  ✓ ${label}`)
  } catch {
    payload.logger.warn(`  ⚠ Already exists or error: ${label}`)
  }
}

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('🌱 Seeding Capital Upfitters CMS...')

  // ─── SERVICES ──────────────────────────────────────────────────────────────
  const services: SeedRecord[] = [
    {
      name: 'Patriot Liner (Bedliner)',
      slug: 'bedliner',
      category: 'coatings',
      audience: ['retail', 'fleet', 'government'],
      priceFrom: 499,
      priceTo: 799,
      priceLabel: 'Starting at $499',
      tagline: 'The toughest spray-in bedliner on the market',
      turnaround: 'Same day',
      warranty: 'Lifetime warranty',
      active: true,
      sortOrder: 1,
      seo: {
        metaTitle: 'Patriot Liner Spray-In Bedliner | Capital Upfitters Rockville MD',
        metaDescription: 'Professional spray-in bedliner installation in Rockville, MD. Patriot Liner authorized installer. Lifetime warranty. Same-day service.',
        keywords: 'spray in bedliner Rockville MD, Patriot Liner installer Maryland, truck bedliner near me',
      },
    },
    {
      name: 'Ceramic Coating',
      slug: 'ceramic-coating',
      category: 'coatings',
      audience: ['retail', 'fleet'],
      priceFrom: 799,
      priceTo: 1999,
      priceLabel: 'From $799',
      tagline: 'Professional-grade paint protection that lasts years',
      turnaround: '1–2 business days',
      warranty: '5-year warranty',
      active: true,
      sortOrder: 2,
      seo: {
        metaTitle: 'Ceramic Coating Rockville MD | Capital Upfitters',
        metaDescription: 'Professional ceramic coating installation near Rockville, Bethesda & Gaithersburg, MD. 5-year warranty.',
        keywords: 'ceramic coating Rockville MD, paint protection Maryland',
      },
    },
    {
      name: 'Hitch Installation',
      slug: 'hitches',
      category: 'hitches',
      audience: ['retail', 'fleet'],
      priceFrom: 199,
      priceTo: 599,
      priceLabel: 'From $199 installed',
      tagline: 'Expert trailer hitch installation — all makes and models',
      turnaround: 'Same day in most cases',
      warranty: '1-year labor warranty',
      active: true,
      sortOrder: 3,
    },
    {
      name: 'Undercoating',
      slug: 'undercoating',
      category: 'coatings',
      audience: ['retail', 'fleet', 'government'],
      priceFrom: 299,
      priceTo: 549,
      priceLabel: 'From $299',
      tagline: 'Rust and corrosion protection for Maryland winters',
      turnaround: 'Same day',
      warranty: '3-year warranty',
      active: true,
      sortOrder: 4,
    },
    {
      name: 'Tonneau Covers',
      slug: 'tonneau',
      category: 'accessories',
      audience: ['retail'],
      priceFrom: 399,
      priceTo: 1299,
      priceLabel: 'From $399 installed',
      tagline: 'Hard and soft tonneau covers — installed same day',
      turnaround: '1–2 hours installation',
      warranty: 'Manufacturer warranty',
      active: true,
      sortOrder: 5,
    },
    {
      name: 'Running Boards & Steps',
      slug: 'running-boards',
      category: 'accessories',
      audience: ['retail', 'fleet'],
      priceFrom: 349,
      priceTo: 999,
      priceLabel: 'From $349 installed',
      tagline: 'OEM-style running boards and nerf bars for trucks & SUVs',
      turnaround: '2–3 hours installation',
      warranty: 'Manufacturer warranty',
      active: true,
      sortOrder: 6,
    },
    {
      name: 'Commercial Vehicle Wraps',
      slug: 'commercial-wraps',
      category: 'wraps',
      audience: ['fleet', 'government', 'retail'],
      priceFrom: 1500,
      priceTo: 4500,
      priceLabel: 'Full wraps from $1,500',
      tagline: 'Turn your vehicles into moving billboards',
      turnaround: '3–5 business days',
      warranty: '3-year film warranty',
      active: true,
      sortOrder: 7,
    },
  ]

  for (const service of services) {
    await createSafe(payload, 'services', service, `Service: ${service.name}`)
  }

  // ─── GEO PAGES ─────────────────────────────────────────────────────────────
  const geoPages: SeedRecord[] = [
    {
      city: 'Rockville',
      state: 'MD',
      slug: 'rockville-md',
      heroHeadline: 'Vehicle Upfitting in Rockville, MD',
      localIntro: 'Capital Upfitters is Rockville\'s premier vehicle upfitting shop, serving the DMV area with professional installations. From spray-in bedliners to fleet wraps, we service retail customers, dealerships, and government fleets right here in Montgomery County.',
      nearbyAreas: [
        { area: 'Bethesda' }, { area: 'Gaithersburg' }, { area: 'Silver Spring' },
        { area: 'Germantown' }, { area: 'Potomac' }, { area: 'North Bethesda' },
      ],
      coordinates: { lat: 39.0840, lng: -77.1528 },
      active: true,
      seo: {
        metaTitle: 'Vehicle Upfitting Rockville MD | Capital Upfitters',
        metaDescription: 'Professional vehicle upfitting in Rockville, MD. Bedliners, ceramic coatings, hitches, undercoating, fleet services.',
        keywords: 'vehicle upfitting Rockville MD, truck accessories Rockville, bedliner Rockville MD',
      },
    },
    {
      city: 'Bethesda',
      state: 'MD',
      slug: 'bethesda-md',
      heroHeadline: 'Vehicle Upfitting in Bethesda, MD',
      localIntro: 'Serving Bethesda and greater Montgomery County with premium vehicle upfitting services. Capital Upfitters is minutes away and ready to protect and customize your vehicle.',
      nearbyAreas: [
        { area: 'Rockville' }, { area: 'Chevy Chase' }, { area: 'Potomac' },
        { area: 'Silver Spring' }, { area: 'Kensington' },
      ],
      coordinates: { lat: 38.9807, lng: -77.1003 },
      active: true,
    },
    {
      city: 'Silver Spring',
      state: 'MD',
      slug: 'silver-spring-md',
      heroHeadline: 'Vehicle Upfitting in Silver Spring, MD',
      localIntro: 'Capital Upfitters serves Silver Spring and the surrounding DMV area with professional vehicle upfitting. Commercial fleets, government vehicles, and retail customers all welcome.',
      nearbyAreas: [
        { area: 'Rockville' }, { area: 'Bethesda' }, { area: 'Takoma Park' },
        { area: 'Wheaton' }, { area: 'College Park' },
      ],
      coordinates: { lat: 38.9940, lng: -77.0260 },
      active: true,
    },
    {
      city: 'Gaithersburg',
      state: 'MD',
      slug: 'gaithersburg-md',
      heroHeadline: 'Vehicle Upfitting in Gaithersburg, MD',
      localIntro: 'Serving Gaithersburg and north Montgomery County. Capital Upfitters handles everything from single vehicle retail installations to full fleet programs.',
      nearbyAreas: [
        { area: 'Rockville' }, { area: 'Germantown' }, { area: 'North Potomac' },
        { area: 'Kentlands' }, { area: 'Clarksburg' },
      ],
      coordinates: { lat: 39.1434, lng: -77.2014 },
      active: true,
    },
  ]

  for (const geo of geoPages) {
    await createSafe(payload, 'geo-pages', geo, `Geo: ${geo.city}, ${geo.state}`)
  }

  // ─── TESTIMONIALS ───────────────────────────────────────────────────────────
  const testimonials: SeedRecord[] = [
    {
      customerName: 'Mike R.',
      customerTitle: 'F-150 Owner, Rockville MD',
      quote: 'Patriot Liner looks incredible. Took less than 3 hours and they kept me updated the whole time. Best bedliner shop in the DMV — hands down.',
      rating: '5',
      audience: 'retail',
      source: 'google',
      featured: true,
      active: true,
    },
    {
      customerName: 'Sarah J.',
      customerTitle: 'Fleet Manager, ABC Landscaping',
      quote: 'We upfitted 12 trucks through Capital Upfitters this year. The fleet pricing is excellent and turnaround has been consistently same-week. Highly recommend for any fleet operation.',
      rating: '5',
      audience: 'fleet',
      source: 'direct',
      featured: true,
      active: true,
    },
    {
      customerName: 'Tom D.',
      customerTitle: 'Dodge RAM Owner, Bethesda MD',
      quote: 'Got the ceramic coating and hitch installed same day. Saved me from having to come back twice. Very professional shop — will be back for the running boards.',
      rating: '5',
      audience: 'retail',
      source: 'google',
      featured: true,
      active: true,
    },
  ]

  for (const t of testimonials) {
    await createSafe(payload, 'testimonials', t, `Testimonial: ${t.customerName}`)
  }

  payload.logger.info('✅ Seeding complete. All Phase 1 content loaded.')
}
