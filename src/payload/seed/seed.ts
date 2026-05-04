/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Upfit Portal — Seed Script
 *
 * Creates Capital Upfitters as the first organization, an owner user,
 * the 12 service categories, the 11 DMV cities, default content blocks,
 * and the AI brand profile.
 *
 * Idempotent: safe to re-run. Existing records are skipped.
 *
 * Run:  npx payload run src/payload/seed/seed.ts
 */

import type { Payload } from 'payload'

type Dict = Record<string, unknown>

// ───────────────────────────────────────────────────────────
// Config — override via env in real deploys
// ───────────────────────────────────────────────────────────

const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL || 'admin@capitalupfitters.com'
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD || 'admin'
const OWNER_NAME = process.env.SEED_OWNER_NAME || 'Capital Upfitters Owner'

// ───────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────

async function findOrCreate(
  payload: Payload,
  collection: string,
  matchField: string,
  matchValue: unknown,
  data: Dict,
  label: string,
): Promise<any> {
  try {
    const existing = await payload.find({
      collection: collection as any,
      where: { [matchField]: { equals: matchValue } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) {
      payload.logger.info(`  · exists: ${label}`)
      return existing.docs[0]
    }
    const created = await payload.create({ collection: collection as any, data: data as any })
    payload.logger.info(`  ✓ created: ${label}`)
    return created
  } catch (e) {
    payload.logger.warn(`  ⚠ failed: ${label} — ${(e as Error).message}`)
    return null
  }
}

// ───────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('🌱 Seeding Upfit Portal — Capital Upfitters tenant…')

  // ── 1. Organization ──────────────────────────────────────
  const org = await findOrCreate(
    payload,
    'organizations',
    'slug',
    'capital-upfitters',
    {
      name: 'Capital Upfitters',
      slug: 'capital-upfitters',
      type: 'shop',
      status: 'active',
      plan: 'internal',
      primaryDomain: 'capitalupfitters.com',
      contact: {
        phone: '(301) 304-1419',
        email: 'CapitalUpfitters@gmail.com',
        address: '12019 Nebel Street',
        city: 'Rockville',
        state: 'MD',
        zip: '20852',
      },
      branding: {
        primaryColor: '#203055',
        tagline: "DMV's Most Trusted Vehicle Upfitter",
      },
    },
    'Organization: Capital Upfitters',
  )
  if (!org) throw new Error('Could not create or find Capital Upfitters org. Aborting seed.')
  const orgId = org.id

  // ── 2. Owner user ────────────────────────────────────────
  const owner = await findOrCreate(
    payload,
    'users',
    'email',
    OWNER_EMAIL,
    {
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      name: OWNER_NAME,
      role: 'owner',
      defaultOrganization: orgId,
    },
    `Owner user: ${OWNER_EMAIL}`,
  )

  if (owner) {
    await findOrCreate(
      payload,
      'org-memberships',
      'user',
      owner.id,
      {
        user: owner.id,
        organization: orgId,
        role: 'owner',
        status: 'active',
        isDefault: true,
      },
      `Membership: owner → Capital Upfitters`,
    )
  }

  // ── 3. Services (all 12 categories) ──────────────────────
  const services: Dict[] = [
    {
      name: 'Spray-In Bedliner (Patriot Liner)',
      slug: 'bedliner',
      category: 'bedliners',
      audience: ['retail', 'fleet', 'government'],
      priceFrom: 499,
      priceTo: 799,
      priceLabel: 'Starting at $499',
      tagline: 'The toughest spray-in bedliner on the market',
      shortDescription:
        'Authorized Patriot Liner installer. Permanent, textured, lifetime-warrantied bed protection in any color.',
      turnaround: 'Same day',
      warranty: 'Lifetime warranty',
      sortOrder: 1,
      seo: {
        metaTitle: 'Patriot Liner Spray-In Bedliner | Rockville MD | Capital Upfitters',
        metaDescription:
          'Professional spray-in bedliner installation in Rockville MD. Authorized Patriot Liner installer. Lifetime warranty. Same-day service.',
        h1: 'Patriot Liner Spray-In Bedliners — Rockville, MD',
        schemaType: 'Service',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.85,
        changeFrequency: 'weekly',
        keywords: 'spray in bedliner Rockville MD, Patriot Liner installer Maryland',
      },
    },
    {
      name: 'Hitches & Towing',
      slug: 'hitches',
      category: 'hitches',
      audience: ['retail', 'fleet'],
      priceFrom: 199,
      priceTo: 1500,
      priceLabel: 'From $199',
      tagline: 'Receiver hitches, gooseneck conversions, brake controllers',
      shortDescription:
        'Class I–V hitches, fifth-wheel and gooseneck preps, custom wiring, brake controllers — installed same-day.',
      turnaround: '1–4 hours',
      warranty: '1-year install warranty',
      sortOrder: 2,
      seo: {
        metaTitle: 'Hitch Installation Rockville MD | Trailer Hitches | Capital Upfitters',
        metaDescription:
          'Same-day trailer hitch installation in Rockville MD. Receiver hitches, gooseneck, fifth-wheel, brake controllers, wiring.',
        h1: 'Trailer Hitch Installation in Rockville, MD',
        schemaType: 'Service',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.85,
        changeFrequency: 'weekly',
      },
    },
    {
      name: 'Undercoating & Rust Protection',
      slug: 'undercoating',
      category: 'undercoating',
      audience: ['retail', 'fleet', 'government'],
      priceFrom: 399,
      priceTo: 899,
      priceLabel: 'From $399',
      tagline: 'Protect from DMV salt, slush, and road grime',
      shortDescription:
        'Full undercarriage rust-inhibiting coating. Quiets road noise. Critical for Maryland winters.',
      turnaround: 'Same day',
      warranty: '5-year reapplication warranty',
      sortOrder: 3,
      seo: {
        metaTitle: 'Undercoating & Rust Protection | Rockville MD | Capital Upfitters',
        metaDescription:
          'Full undercarriage undercoating and rust protection in Rockville MD. Salt-belt-grade. 5-year warranty.',
        h1: 'Undercoating & Rust Protection — Rockville, MD',
        schemaType: 'Service',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.85,
        changeFrequency: 'weekly',
      },
    },
    {
      name: 'Ceramic Coating & PPF',
      slug: 'ceramic-coating',
      category: 'ceramic-ppf',
      audience: ['retail', 'fleet'],
      priceFrom: 799,
      priceTo: 1999,
      priceLabel: 'From $799',
      tagline: 'Pro-grade nano-ceramic paint protection',
      shortDescription:
        'Multi-year nano-ceramic coatings and full or partial paint protection film. Certified technicians.',
      turnaround: '1–3 business days',
      warranty: '5-year warranty',
      sortOrder: 4,
      seo: {
        metaTitle: 'Ceramic Coating & PPF | Rockville MD | Capital Upfitters',
        metaDescription:
          'Professional ceramic coating and paint protection film in Rockville MD. 5-year warranty. Certified technicians.',
        h1: 'Ceramic Coating & PPF in Rockville, MD',
        schemaType: 'Service',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.85,
        changeFrequency: 'weekly',
      },
    },
    {
      name: 'Truck Accessories',
      slug: 'truck-accessories',
      category: 'accessories',
      audience: ['retail'],
      priceLabel: 'Quote on request',
      tagline: 'Toolboxes, lighting, racks, and everything in between',
      shortDescription:
        'Complete catalog of truck accessories from top brands — installed by experienced techs.',
      turnaround: 'Same day to 1 week',
      warranty: 'Manufacturer + install warranty',
      sortOrder: 5,
      seo: {
        metaTitle: 'Truck Accessories Rockville MD | Capital Upfitters',
        metaDescription:
          'Toolboxes, lighting, racks, and truck accessories installed in Rockville MD. Top brands. Expert installation.',
        h1: 'Truck Accessories in Rockville, MD',
        schemaType: 'Service',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.8,
      },
    },
    {
      name: 'Tonneau Covers',
      slug: 'tonneau',
      category: 'tonneau',
      audience: ['retail'],
      priceFrom: 399,
      priceTo: 1899,
      priceLabel: 'From $399',
      tagline: 'Soft fold, hard fold, retractable, roll-up',
      shortDescription:
        'All major tonneau styles for every popular truck. Same-day installation on most in-stock units.',
      turnaround: '1–2 hours',
      sortOrder: 6,
      seo: {
        metaTitle: 'Tonneau Covers Rockville MD | Capital Upfitters',
        metaDescription:
          'Soft, hard fold, retractable, and roll-up tonneau covers installed in Rockville MD. Same-day on stock units.',
        h1: 'Tonneau Covers — Rockville, MD',
        schemaType: 'Service',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.85,
      },
    },
    {
      name: 'Running Boards & Steps',
      slug: 'running-boards',
      category: 'running-boards',
      audience: ['retail'],
      priceFrom: 299,
      priceTo: 1499,
      priceLabel: 'From $299',
      tagline: 'Steel, aluminum, AMP Research powered steps',
      shortDescription:
        'Standard nerf bars, drop steps, and AMP Research electric powered running boards.',
      turnaround: '1–3 hours',
      sortOrder: 7,
      seo: {
        metaTitle: 'Running Boards & Powered Steps | Rockville MD | Capital Upfitters',
        metaDescription:
          'Steel, aluminum, and AMP Research powered running boards installed in Rockville MD.',
        h1: 'Running Boards & Steps — Rockville, MD',
        schemaType: 'Service',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.85,
      },
    },
    {
      name: 'Commercial Van Upfits',
      slug: 'van-upfits',
      category: 'van-upfits',
      audience: ['fleet', 'dealer', 'government'],
      priceLabel: 'Quote on request',
      tagline: 'Sprinter, Transit, ProMaster — turnkey work-ready builds',
      shortDescription:
        'Shelving, partitions, ladder racks, vinyl, lighting, and DOT compliance for cargo vans.',
      turnaround: '1–2 weeks',
      warranty: 'Per-component manufacturer warranty',
      sortOrder: 8,
      seo: {
        metaTitle: 'Commercial Van Upfits | Sprinter, Transit, ProMaster | DMV',
        metaDescription:
          'Professional cargo van upfitting in Rockville MD: shelving, partitions, racks, lighting, DOT compliance.',
        h1: 'Commercial Van Upfits — DMV',
        schemaType: 'Service',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.9,
      },
    },
    {
      name: 'Fleet Upfitting',
      slug: 'fleet',
      category: 'fleet',
      audience: ['fleet'],
      priceLabel: 'Volume pricing — quote on request',
      tagline: 'Bulk scheduling, branding, and DOT compliance',
      shortDescription:
        'One account for your entire fleet. Bulk scheduling, fleet branding, and bedliners/coatings on every vehicle.',
      turnaround: 'Bulk schedule',
      warranty: 'Per-component manufacturer warranty',
      sortOrder: 9,
      seo: {
        metaTitle: 'Fleet Upfitting Rockville MD | Capital Upfitters',
        metaDescription:
          'Fleet vehicle upfitting and bulk scheduling in the DMV. No minimums. Volume pricing.',
        h1: 'Fleet Upfitting — DMV',
        schemaType: 'Service',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.9,
      },
    },
    {
      name: 'Dealer Services',
      slug: 'dealer',
      category: 'dealer',
      audience: ['dealer'],
      priceLabel: 'Wholesale pricing',
      tagline: 'Pre-delivery customization for car dealers',
      shortDescription:
        'White-glove pre-delivery upfitting and accessories for dealerships. Volume pricing, fast turnaround.',
      turnaround: 'Same week',
      sortOrder: 10,
      seo: {
        metaTitle: 'Dealer Pre-Delivery Upfitting | DMV | Capital Upfitters',
        metaDescription:
          'Pre-delivery vehicle customization and upfitting for car dealers in the DMV.',
        h1: 'Dealer Services — Pre-Delivery Upfitting',
        schemaType: 'Service',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.85,
      },
    },
    {
      name: 'Government / Municipal Services',
      slug: 'government',
      category: 'government',
      audience: ['government'],
      priceLabel: 'State contract pricing',
      tagline: 'State contracts, government fleet, and Upfit Portal',
      shortDescription:
        'Government fleet upfitting, state contract support, and the Upfit Portal for procurement officers.',
      turnaround: 'Per contract',
      sortOrder: 11,
      seo: {
        metaTitle: 'Government & Municipal Vehicle Upfitting | DMV | Capital Upfitters',
        metaDescription:
          'State contract vehicle upfitting for government fleets in MD, VA, and DC.',
        h1: 'Government & Municipal Vehicle Upfitting',
        schemaType: 'Service',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.85,
      },
    },
    {
      name: 'Industrial Protective Coatings',
      slug: 'industrial-coatings',
      category: 'industrial',
      audience: ['fleet', 'government'],
      priceLabel: 'Quote on request',
      tagline: 'Industrial-grade coatings for equipment, trailers, machinery',
      shortDescription:
        'Patriot Liner and other industrial-grade coatings for equipment, trailers, and heavy machinery.',
      turnaround: 'Per project',
      warranty: 'Per-coating manufacturer warranty',
      sortOrder: 12,
      seo: {
        metaTitle: 'Industrial Protective Coatings | Equipment, Trailers, Machinery | DMV',
        metaDescription:
          'Industrial-grade Patriot Liner and protective coatings for equipment, trailers, and heavy machinery in the DMV.',
        h1: 'Industrial Protective Coatings',
        schemaType: 'Service',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.85,
      },
    },
  ]

  payload.logger.info('  Services…')
  for (const s of services) {
    await findOrCreate(payload, 'services', 'slug', s.slug, { ...s, organization: orgId, active: true }, `Service: ${s.name}`)
  }

  // ── 4. Locations (11 DMV cities) ─────────────────────────
  const locations: Dict[] = [
    { city: 'Rockville', state: 'MD', county: 'Montgomery', slug: 'rockville-md',
      heroHeadline: 'Vehicle Upfitting in Rockville, MD',
      localIntro: 'Located right in Rockville at 12019 Nebel Street, Capital Upfitters has been the trusted choice for truck owners, fleets, and dealerships across Montgomery County for 30+ years.',
      coordinates: { lat: 39.084, lng: -77.1528 } },
    { city: 'Bethesda', state: 'MD', county: 'Montgomery', slug: 'bethesda-md',
      heroHeadline: 'Vehicle Upfitting Serving Bethesda, MD',
      localIntro: 'Bethesda truck and SUV owners trust Capital Upfitters for bedliners, ceramic coating, hitches, and accessories — just minutes from downtown Bethesda.',
      coordinates: { lat: 38.9847, lng: -77.0947 } },
    { city: 'Silver Spring', state: 'MD', county: 'Montgomery', slug: 'silver-spring-md',
      heroHeadline: 'Vehicle Upfitting Serving Silver Spring, MD',
      localIntro: 'Capital Upfitters serves Silver Spring drivers and contractors with same-week turnaround on bedliners, hitches, undercoating, and fleet upfits.',
      coordinates: { lat: 38.9907, lng: -77.0261 } },
    { city: 'Gaithersburg', state: 'MD', county: 'Montgomery', slug: 'gaithersburg-md',
      heroHeadline: 'Vehicle Upfitting Serving Gaithersburg, MD',
      localIntro: 'A short drive from Gaithersburg — same-week appointments for bedliners, ceramic coating, hitches, and fleet upfits.',
      coordinates: { lat: 39.1434, lng: -77.2014 } },
    { city: 'Germantown', state: 'MD', county: 'Montgomery', slug: 'germantown-md',
      heroHeadline: 'Vehicle Upfitting Serving Germantown, MD',
      localIntro: 'Germantown truck owners and contractors come to Capital Upfitters for everything from Patriot Liner bedliners to full van upfits.',
      coordinates: { lat: 39.1732, lng: -77.2717 } },
    { city: 'Potomac', state: 'MD', county: 'Montgomery', slug: 'potomac-md',
      heroHeadline: 'Vehicle Upfitting Serving Potomac, MD',
      localIntro: 'Potomac residents and businesses trust Capital Upfitters for premium ceramic coatings, paint protection film, and accessories.',
      coordinates: { lat: 39.0181, lng: -77.2086 } },
    { city: 'Frederick', state: 'MD', county: 'Frederick', slug: 'frederick-md',
      heroHeadline: 'Vehicle Upfitting Serving Frederick, MD',
      localIntro: 'A worthwhile trip from Frederick for the DMV\'s most trusted upfitter — bedliners, undercoating, hitches, fleet work.',
      coordinates: { lat: 39.4143, lng: -77.4105 } },
    { city: 'Washington', state: 'DC', county: 'District of Columbia', slug: 'washington-dc',
      heroHeadline: 'Vehicle Upfitting Serving Washington, DC',
      localIntro: 'Capital Upfitters serves Washington DC drivers, fleets, and government clients with state contract pricing and same-week appointments.',
      coordinates: { lat: 38.9072, lng: -77.0369 } },
    { city: 'Arlington', state: 'VA', county: 'Arlington', slug: 'arlington-va',
      heroHeadline: 'Vehicle Upfitting Serving Arlington, VA',
      localIntro: 'Arlington truck owners and businesses cross the Potomac for our 30+ year reputation in bedliners, coatings, and upfits.',
      coordinates: { lat: 38.8816, lng: -77.0910 } },
    { city: 'Alexandria', state: 'VA', county: 'Alexandria', slug: 'alexandria-va',
      heroHeadline: 'Vehicle Upfitting Serving Alexandria, VA',
      localIntro: 'A quick drive from Alexandria for premium ceramic coatings, bedliners, and fleet upfits.',
      coordinates: { lat: 38.8048, lng: -77.0469 } },
    { city: 'Fairfax', state: 'VA', county: 'Fairfax', slug: 'fairfax-va',
      heroHeadline: 'Vehicle Upfitting Serving Fairfax, VA',
      localIntro: 'Fairfax County truck owners, contractors, and dealerships trust Capital Upfitters for upfitting and protective coatings.',
      coordinates: { lat: 38.8462, lng: -77.3064 } },
  ]

  payload.logger.info('  Locations…')
  for (const l of locations) {
    await findOrCreate(payload, 'geo-pages', 'slug', l.slug, {
      ...l,
      organization: orgId,
      active: true,
      seo: {
        metaTitle: `${l.heroHeadline} | Capital Upfitters`,
        metaDescription: `${l.localIntro}`.slice(0, 158),
        h1: l.heroHeadline,
        schemaType: 'LocalBusiness',
        indexable: true,
        includeInSitemap: true,
        sitemapPriority: 0.75,
        changeFrequency: 'weekly',
      },
    }, `Location: ${l.city}, ${l.state}`)
  }

  // ── 5. Content Blocks (9 reusable blocks) ────────────────
  const blocks: Dict[] = [
    { name: 'Standard CTA — Get a Quote', blockType: 'cta',
      headline: 'Ready to upfit?',
      subtext: 'Get a free quote in minutes. We respond within 4 hours during business hours.',
      cta: { label: 'Get a Free Quote', url: '/quote.html' } },
    { name: 'Why Choose Us — 4 reasons', blockType: 'service-card',
      headline: 'Why Capital Upfitters', subtext: '30+ years. Lifetime warranties. Same-week turnaround.',
      items: [
        { title: 'Family-Owned Since 1994', body: 'Built on referrals, repeat customers, and zero shortcuts.' },
        { title: 'Same-Week Turnaround', body: 'Call Monday, done by Friday. We respect your time.' },
        { title: 'Authorized Installers', body: 'Patriot Liner, AMP Research, and other top brands.' },
        { title: 'Lifetime Warranty', body: 'On core services like Patriot Liner bedliners.' },
      ] },
    { name: 'Homepage Hero', blockType: 'hero',
      headline: 'Premium Vehicle Upfitting', subtext: "DMV's Most Trusted Shop — Family-Owned 30+ Years",
      cta: { label: 'Explore Options', url: '/services/' } },
    { name: 'Common FAQ — Retail', blockType: 'faq',
      headline: 'Frequently asked',
      items: [
        { title: 'How long does a bedliner take?', body: 'Most spray-in bedliners are completed same-day. Drop off in the morning, drive away that afternoon.' },
        { title: 'Do you warranty your work?', body: 'Yes. Patriot Liner bedliners come with a lifetime warranty. Other services have warranties from 1 year to 5 years depending on the product.' },
        { title: 'Do you serve fleets?', body: 'Yes — bulk scheduling, fleet branding, and DOT compliance. No minimums.' },
      ] },
    { name: 'Fleet CTA', blockType: 'cta',
      headline: 'Run a fleet?',
      subtext: 'One account, volume pricing, no minimums.',
      cta: { label: 'Talk to Fleet Team', url: '/fleet.html' } },
    { name: 'Dealer / Gov CTA', blockType: 'cta',
      headline: 'Dealer or government buyer?',
      subtext: 'Pre-delivery customization, state contracts, Upfit Portal access.',
      cta: { label: 'Open Dealer & Gov Hub', url: '/dealer-government.html' } },
    { name: 'Featured Gallery — Trucks', blockType: 'gallery', headline: 'Recent work', items: [] },
    { name: 'Pricing Tiers — Bedliners', blockType: 'pricing',
      headline: 'Patriot Liner pricing', subtext: 'Honest, no-surprises pricing.',
      items: [
        { title: 'Compact Truck Bed', price: '$499' },
        { title: 'Full-Size Bed', price: '$649' },
        { title: 'Heavy-Duty / Long Bed', price: '$799' },
      ] },
    { name: 'Comparison — Patriot Liner vs Drop-In', blockType: 'comparison',
      headline: 'Spray-in vs drop-in: what to know',
      items: [
        { title: 'Spray-in (Patriot Liner)', body: 'Bonded, textured, lifetime warranty, no shifting.' },
        { title: 'Drop-in', body: 'Cheap, but traps water and moves.' },
      ] },
  ]

  payload.logger.info('  Content blocks…')
  for (const b of blocks) {
    await findOrCreate(payload, 'content-blocks', 'name', b.name, { ...b, organization: orgId }, `Block: ${b.name}`)
  }

  // ── 6. AI Profile global ─────────────────────────────────
  payload.logger.info('  AI Profile…')
  try {
    await payload.updateGlobal({
      slug: 'ai-profile' as any,
      data: {
        brandVoice:
          'Confident, family-owned, straight-talking. Prioritize clarity over cleverness. Speak like a trusted shop foreman: friendly, technical when needed, never salesy.',
        targetAudience:
          'Truck owners, fleet managers, dealers, and government procurement officers in the DMV (DC / Maryland / Virginia). Mix of consumers and commercial buyers.',
        tone: ['professional', 'friendly', 'confident', 'local'],
        approvedPhrases: [
          { phrase: 'DMV\'s Most Trusted Shop' },
          { phrase: 'Same-week turnaround' },
          { phrase: 'Family-owned since 1994' },
          { phrase: 'Authorized Patriot Liner installer' },
          { phrase: 'Lifetime warranty' },
        ],
        doNotSay: [
          { phrase: 'cheap' },
          { phrase: 'discount' },
          { phrase: 'fastest in the world' },
          { phrase: 'guaranteed lowest price' },
        ],
        rejectedPhrases: [
          { find: 'low cost', replaceWith: 'fair pricing' },
          { find: 'unbeatable', replaceWith: 'competitive' },
        ],
        preferredCta: 'Get a free quote',
        mainServices: services.map((s) => ({ service: s.name as string })),
        targetCities: locations.map((l) => ({ city: `${l.city}, ${l.state}` })),
        warrantyRules:
          'Only claim "lifetime warranty" for Patriot Liner bedliners. All other warranties are component-specific (typically 1–5 years). Never overstate.',
        pricingRules:
          'Quote ranges only ("from $499", "from $799"). Never give exact prices without a vehicle inspection. Always offer to send a written quote.',
        imageGenerationStyle:
          'High-quality automotive photography. Crisp lighting, clean shop background or outdoor on-location. No stock-photo gloss. Show real DMV-area trucks/vans.',
        captionExamples: [
          { caption: 'Patriot Liner spray-in bedliner — F-250 Super Duty, freshly cured.' },
          { caption: 'Class IV hitch + 7-pin wiring on a Chevy Silverado 1500. Same-day install.' },
          { caption: 'Sprinter 2500 cargo van — full shelving, partition, ladder rack upfit.' },
        ],
      } as any,
    } as any)
    payload.logger.info('  ✓ AI Profile updated')
  } catch (e) {
    payload.logger.warn(`  ⚠ AI Profile update failed: ${(e as Error).message}`)
  }

  // ── 7. Settings global — backfill missing pieces ─────────
  payload.logger.info('  Business Settings…')
  try {
    await payload.updateGlobal({
      slug: 'settings' as any,
      data: {
        businessName: 'Capital Upfitters',
        contact: {
          phone: '(301) 304-1419',
          email: 'CapitalUpfitters@gmail.com',
          address: '12019 Nebel Street, Rockville, MD 20852',
          fullAddress: '12019 Nebel Street, Rockville, MD 20852',
        },
        hours: {
          weekdays: 'Mon–Fri: 9:30am–4:30pm',
          saturday: 'By appointment',
          sunday: 'Closed',
        },
        urgency: {
          enabled: true,
          message1: 'Same-week appointments available — call (301) 304-1419',
          message2: 'Fleet pricing available — no minimums',
        },
        seo: {
          defaultTitle: 'Capital Upfitters | DMV\'s Most Trusted Vehicle Upfitter | Rockville MD',
          defaultDescription:
            'Family-owned vehicle upfitter in Rockville, MD. Patriot Liner bedliners, ceramic coatings, hitches, undercoating, and fleet upfitting since 1994.',
        },
      } as any,
    } as any)
    payload.logger.info('  ✓ Settings updated')
  } catch (e) {
    payload.logger.warn(`  ⚠ Settings update failed: ${(e as Error).message}`)
  }

  payload.logger.info('🌱 Seed complete.')
  payload.logger.info('')
  payload.logger.info('  Login at /portal/login')
  payload.logger.info(`  Email:    ${OWNER_EMAIL}`)
  payload.logger.info(`  Password: ${OWNER_PASSWORD}`)
  payload.logger.info('  CHANGE THIS PASSWORD IMMEDIATELY in production.')
}
