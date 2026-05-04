/**
 * SEO Audit — pure functions that score Pages, Services, and GeoPages.
 *
 * No persistence — runs on demand from /api/portal/seo-audit. Powers both
 * per-record warnings and the site-wide SEO Manager view.
 */

export type SeoSeverity = 'error' | 'warning' | 'info'

export type SeoWarning = {
  code: string
  field: string
  severity: SeoSeverity
  message: string
  suggestion?: string
}

export type AuditableDoc = {
  id?: string | number
  title?: string
  name?: string
  city?: string
  slug?: string
  heroHeadline?: string
  shortDescription?: string
  description?: unknown
  localIntro?: string
  faqItems?: unknown[]
  internalLinks?: unknown[]
  galleryImages?: { image?: { alt?: string } | null }[]
  heroImage?: { alt?: string } | null
  seo?: {
    metaTitle?: string
    metaDescription?: string
    h1?: string
    canonicalUrl?: string
    ogTitle?: string
    ogDescription?: string
    ogImage?: unknown
    schemaType?: string
    indexable?: boolean
    keywords?: string
  }
}

const TITLE_MIN = 30
const TITLE_MAX = 60
const DESC_MIN = 70
const DESC_MAX = 160

export function auditDoc(doc: AuditableDoc): SeoWarning[] {
  const warnings: SeoWarning[] = []
  const seo = doc.seo ?? {}
  const displayTitle = doc.title || doc.name || doc.city || '(untitled)'

  // ── Meta title ──────────────────────────────────────────
  if (!seo.metaTitle?.trim()) {
    warnings.push({
      code: 'META_TITLE_MISSING',
      field: 'seo.metaTitle',
      severity: 'error',
      message: `Missing meta title on "${displayTitle}".`,
      suggestion: 'Add a 50–60 character meta title that includes your primary keyword.',
    })
  } else {
    const len = seo.metaTitle.length
    if (len < TITLE_MIN) {
      warnings.push({
        code: 'META_TITLE_SHORT',
        field: 'seo.metaTitle',
        severity: 'warning',
        message: `Meta title is short (${len} chars). Aim for ${TITLE_MIN}–${TITLE_MAX}.`,
      })
    }
    if (len > TITLE_MAX) {
      warnings.push({
        code: 'META_TITLE_LONG',
        field: 'seo.metaTitle',
        severity: 'warning',
        message: `Meta title is too long (${len} chars). Google truncates after ~${TITLE_MAX}.`,
      })
    }
  }

  // ── Meta description ────────────────────────────────────
  if (!seo.metaDescription?.trim()) {
    warnings.push({
      code: 'META_DESC_MISSING',
      field: 'seo.metaDescription',
      severity: 'error',
      message: `Missing meta description on "${displayTitle}".`,
      suggestion: 'Add a compelling 140–160 character description with a CTA.',
    })
  } else {
    const len = seo.metaDescription.length
    if (len < DESC_MIN) {
      warnings.push({
        code: 'META_DESC_SHORT',
        field: 'seo.metaDescription',
        severity: 'warning',
        message: `Meta description is short (${len} chars). Aim for ${DESC_MIN}–${DESC_MAX}.`,
      })
    }
    if (len > DESC_MAX) {
      warnings.push({
        code: 'META_DESC_LONG',
        field: 'seo.metaDescription',
        severity: 'warning',
        message: `Meta description is too long (${len} chars). Google truncates after ~${DESC_MAX}.`,
      })
    }
  }

  // ── H1 ──────────────────────────────────────────────────
  const h1 = seo.h1 || doc.heroHeadline
  if (!h1?.trim()) {
    warnings.push({
      code: 'H1_MISSING',
      field: 'heroHeadline',
      severity: 'error',
      message: `Missing H1 on "${displayTitle}". Set Hero Headline or H1 Override.`,
    })
  }

  // ── OG fields ───────────────────────────────────────────
  if (!seo.ogTitle?.trim() && !seo.metaTitle?.trim()) {
    warnings.push({
      code: 'OG_TITLE_MISSING',
      field: 'seo.ogTitle',
      severity: 'info',
      message: 'No Open Graph title — social shares will fall back to meta title.',
    })
  }
  if (!seo.ogImage) {
    warnings.push({
      code: 'OG_IMAGE_MISSING',
      field: 'seo.ogImage',
      severity: 'warning',
      message: 'No Open Graph image — social shares will look unbranded.',
    })
  }

  // ── Indexability sanity ─────────────────────────────────
  if (seo.indexable === false) {
    warnings.push({
      code: 'NOINDEX',
      field: 'seo.indexable',
      severity: 'info',
      message: `"${displayTitle}" is set to noindex. Google will not list it.`,
    })
  }

  // ── Image alt text on gallery ───────────────────────────
  const missingAlts = (doc.galleryImages ?? []).filter(
    (g) => g?.image && !g.image.alt?.trim()
  ).length
  if (missingAlts > 0) {
    warnings.push({
      code: 'IMG_ALT_MISSING',
      field: 'galleryImages',
      severity: 'warning',
      message: `${missingAlts} gallery image(s) missing alt text.`,
    })
  }

  // ── Thin content ────────────────────────────────────────
  const wordCount = countWords(doc)
  if (wordCount < 150) {
    warnings.push({
      code: 'THIN_CONTENT',
      field: 'description',
      severity: 'warning',
      message: `Thin content (~${wordCount} words). Aim for 300+ for SEO weight.`,
    })
  }

  // ── Internal links (geo / service interlinking) ─────────
  if ((doc.internalLinks?.length ?? 0) === 0) {
    warnings.push({
      code: 'INTERNAL_LINKS_MISSING',
      field: 'internalLinks',
      severity: 'info',
      message: 'No internal links defined. Link to related services and locations.',
    })
  }

  return warnings
}

/**
 * Site-wide audit — checks for cross-page issues like duplicate H1s.
 */
export function auditSiteWide(docs: AuditableDoc[]): SeoWarning[] {
  const warnings: SeoWarning[] = []

  // Duplicate meta titles
  const titleMap = new Map<string, AuditableDoc[]>()
  docs.forEach((d) => {
    const t = d.seo?.metaTitle?.trim().toLowerCase()
    if (!t) return
    if (!titleMap.has(t)) titleMap.set(t, [])
    titleMap.get(t)!.push(d)
  })
  titleMap.forEach((list, title) => {
    if (list.length > 1) {
      warnings.push({
        code: 'DUPLICATE_TITLE',
        field: 'seo.metaTitle',
        severity: 'error',
        message: `Duplicate meta title across ${list.length} pages: "${title}".`,
      })
    }
  })

  // Duplicate H1s
  const h1Map = new Map<string, number>()
  docs.forEach((d) => {
    const h = (d.seo?.h1 || d.heroHeadline || '').trim().toLowerCase()
    if (!h) return
    h1Map.set(h, (h1Map.get(h) ?? 0) + 1)
  })
  h1Map.forEach((count, h1) => {
    if (count > 1) {
      warnings.push({
        code: 'DUPLICATE_H1',
        field: 'heroHeadline',
        severity: 'warning',
        message: `Duplicate H1 across ${count} pages: "${h1}".`,
      })
    }
  })

  return warnings
}

function countWords(doc: AuditableDoc): number {
  const parts: string[] = []
  if (doc.heroHeadline) parts.push(doc.heroHeadline)
  if (doc.shortDescription) parts.push(doc.shortDescription)
  if (doc.localIntro) parts.push(doc.localIntro)
  if (typeof doc.description === 'string') parts.push(doc.description)
  if (doc.description && typeof doc.description === 'object') {
    parts.push(JSON.stringify(doc.description))
  }
  if (doc.faqItems) {
    doc.faqItems.forEach((f) => parts.push(JSON.stringify(f)))
  }
  return parts.join(' ').split(/\s+/).filter(Boolean).length
}
