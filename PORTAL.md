# Upfit Portal

The Upfit Portal is a branded admin built on top of Payload CMS that gives
Capital Upfitters (and future tenants) a single operational control center for
their public website, leads, gallery, locations, and AI content profile.

It lives at **`/portal`** and is deliberately separate from Payload's default
`/admin` UI, which remains available as a power-user fallback.

---

## Stack

- **Framework:** Next.js 15 (App Router) + Payload CMS 3.80
- **Database:** Vercel Postgres (Neon) via `@payloadcms/db-vercel-postgres`
- **Styling:** Tailwind 3.4, custom CSS variables in `src/app/portal/portal.css`
- **Typography:** Inter (body) + Barlow Condensed (display) — matches the public site
- **Color palette:** dark `#111827` nav, `#203055` accent navy — matches the public site

The portal is server-rendered. Every authed page calls
`requirePortalSession()` from `src/lib/portalAuth.ts`, which redirects to
`/portal/login` if no Payload session cookie is present.

---

## Route map

```
/portal/login                 ← email + password form, POSTs to /api/users/login
/portal                       ← dashboard (9 metric cards + recent activity)
/portal/leads                 ← lead inbox with status filter chips
/portal/leads/[id]            ← lead detail + status / priority / notes form
/portal/pages                 ← page list (edit deep-links to /admin)
/portal/services              ← services list (12-category catalog)
/portal/locations             ← city / geo pages list
/portal/gallery               ← media gallery list
/portal/blocks                ← reusable content blocks (hero, CTA, FAQ, gallery, comparison, pricing)
/portal/seo                   ← SEO Manager: site-wide warnings + per-record audit
/portal/ai-profile            ← brand voice / tone / approved phrases (read-only view; edits at /admin/globals/ai-profile)
/portal/testimonials          ← testimonial list
/portal/faqs                  ← FAQ list
/portal/quotes                ← quote list
/portal/users                 ← user management
/portal/organizations         ← multi-tenant org switcher / list (super-admin)
/portal/settings              ← global settings (links to /admin/globals/settings)
```

API endpoints added in this PR:

```
GET  /api/portal/seo-audit         ← authenticated JSON dump of SEO warnings
GET  /api/public/locations         ← public read of geo-pages (city pages)
GET  /api/public/pages             ← public read of published pages
```

---

## Multi-tenancy

The portal is structured around **organizations**. Every content collection
(`pages`, `services`, `geo-pages`, `media`, `leads`, `testimonials`, `faqs`,
`quotes`, `content-blocks`) carries an optional `organization` relationship to
the `organizations` collection.

- `src/payload/utils/orgScope.ts` exports `orgRelationship`,
  `defaultOrgOnCreate`, `orgReadAccess`, and `orgWriteAccess` — the building
  blocks each collection wires in.
- The field is **non-required** so existing rows from the previous schema
  survive the migration. New rows created through the portal automatically get
  the active user's primary organization assigned via the
  `defaultOrgOnCreate` hook.
- Super-admins (`role: 'super-admin'`) see all orgs. All other roles are
  scoped to their `OrgMembership` rows.

---

## Roles

Defined on the `users` collection:

| Role            | Intended use                                              |
| --------------- | --------------------------------------------------------- |
| `super-admin`   | Platform operator — sees every org                        |
| `owner`         | Org owner — full access inside their org                  |
| `admin`         | Org admin — full access except billing / org settings     |
| `editor`        | Content editor — pages, services, gallery, blocks         |
| `dealer`        | Dealer-channel user (future)                              |
| `shop`          | Shop-floor user (future)                                  |
| `fleet-manager` | Fleet customer portal user (future)                       |
| `staff`         | Read-only / lead handler                                  |

Roles are intentionally over-provisioned — most aren't used yet, but they let
us evolve permissions without another migration.

---

## SEO Manager

`src/lib/seoAudit.ts` exposes two functions:

- `auditDoc(doc, type)` — returns `SeoWarning[]` for a single page / service /
  location record.
- `auditSiteWide(payload)` — runs a fleet of cheap checks across all
  collections and aggregates totals.

Warning codes currently emitted:

```
META_TITLE_MISSING        META_TITLE_TOO_LONG       META_TITLE_TOO_SHORT
META_DESC_MISSING         META_DESC_TOO_LONG        META_DESC_TOO_SHORT
H1_MISSING                DUPLICATE_H1              THIN_CONTENT
IMG_ALT_MISSING           CANONICAL_MISSING         OG_IMAGE_MISSING
INTERNAL_LINKS_LOW        SLUG_NOT_KEBAB            DRAFT_BUT_INDEXABLE
```

`/portal/seo` renders the site-wide totals in the top row and the
warning-by-record breakdown in the table.

---

## AI Profile (scaffolded, no inference yet)

`src/payload/globals/AIProfile.ts` defines a single `ai-profile` global with:

- Brand voice, audience, tone, do-not-say / approved phrases
- Main services + target cities (used as future grounding)
- Warranty + pricing rules
- Image generation style + caption examples

No model calls are wired yet. The schema exists so future "AI write a draft"
or "AI suggest 5 internal links" actions have a single grounding source.

---

## Hybrid editing pattern

Portal list pages render branded tables; row "Edit" buttons deep-link into
`/admin/collections/{slug}/{id}`, which uses Payload's full-featured editor
(rich text, drafts, autosave, version history, live preview).

This was a pragmatic choice: rebuilding Payload's deep edit forms inside the
portal would have meant duplicating thousands of lines of well-tested UI for
no real user benefit. The portal owns navigation, branding, dashboards, and
quick-action surfaces; Payload owns the editor.

If we later need a fully custom edit experience for a specific collection
(e.g. a kanban-style lead board), we can replace the deep-link with a
purpose-built UI — the rest of the portal doesn't change.

---

## Public site integration

The static site (`1vank0/CapitalUpfittersWeb`) reads from the portal via
`/api/public/*` endpoints. `cms-integration.js` was updated in a parallel PR
on that repo to point at `https://capital-upfitters-cms.vercel.app` and to
add opt-in `syncServicesGrid` / `syncTestimonials` helpers that **only
replace DOM content if the CMS returns valid records** — the existing
hardcoded HTML is the fallback. Per the project rules, no public page is
allowed to break when the CMS is unreachable.

See `MIGRATION.md` for the full additive-migration story.
