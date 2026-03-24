# Capital Upfitters CMS

Payload CMS v3 — Operational control center for capitalupfitters.com.

Built on: Next.js 14 · Payload CMS 3.x · SQLite (dev) / PostgreSQL (prod) · Vercel

---

## Collections

| Collection | Purpose |
|---|---|
| **Services** | All services — name, pricing, SEO, FAQs, gallery |
| **Pages** | Core page content — hero, sections, CTAs |
| **Geo Pages** | Location pages — city content, coordinates, local SEO |
| **Media** | Gallery images — categorized, filterable |
| **Testimonials** | Customer reviews — featured, per-service |
| **FAQs** | FAQ items — per-service, per-audience |
| **Tags** | Taxonomy tags for services and media |
| **Users** | Admin and editor accounts |

## Globals

| Global | Purpose |
|---|---|
| **Settings** | Business info, hours, social media, urgency banner, portal URLs |

---

## Getting Started (Dev)

```bash
# Install
npm install

# Run dev server
npm run dev
```

Admin panel: **http://localhost:3000/admin**

Auto-login in dev mode:
- Email: `admin@capitalupfitters.com`
- Password: `admin`

---

## Seed Phase 1 Content

After first launch, seed all existing content:

```bash
npx payload run src/payload/seed/seed.ts
```

This loads:
- 7 services (Patriot Liner, Ceramic, Hitches, Undercoating, Tonneau, Running Boards, Wraps)
- 4 geo pages (Rockville, Bethesda, Silver Spring, Gaithersburg)
- 3 featured testimonials
- 5 FAQ items

---

## Deploy to Vercel

```bash
# Connect repo
vercel --prod

# Required environment variables (set in Vercel dashboard):
# PAYLOAD_SECRET — strong random string
# DATABASE_URL — Supabase/Neon PostgreSQL URL
# NEXT_PUBLIC_SERVER_URL — https://cms-capitalupfitters.vercel.app
```

---

## API Endpoints (for IVANKO OS integration)

All endpoints are REST and GraphQL:

```
GET  /api/services          → All services
GET  /api/services/:id      → Single service
GET  /api/geo-pages         → All geo pages
GET  /api/testimonials      → All testimonials
GET  /api/faqs              → All FAQs
GET  /api/globals/settings  → Business settings
```

GraphQL playground: `/api/graphql-playground`

---

## Architecture

```
src/
  payload/
    collections/    — 7 collections
    globals/        — Settings global
    seed/           — Phase 1 content seed
  app/
    (payload)/      — Admin panel routes
    api/            — REST + GraphQL routes
  payload.config.ts — Main Payload configuration
```

---

## IVANKO OS Integration

This CMS is designed to plug into IVANKO OS Phase 2:
- All collections expose REST + GraphQL APIs
- No hardcoded business logic
- Settings global = single source of truth for all business info
- Media collection = centralized asset management
- Extendable to multi-location without schema changes
