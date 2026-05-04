# Migration: Upfit Portal Schema Changes

This PR introduces multi-tenancy and several new fields without breaking any
existing data. All schema changes are **additive**: every new column is
either nullable, defaulted, or sourced from a hook.

## What changes in the database

### New tables

- `organizations` — tenant root (name, slug, brand colors, plan, owner)
- `org_memberships` — `users` ↔ `organizations` join with a per-org role
- `content_blocks` — reusable hero / CTA / FAQ / gallery / comparison / pricing blocks

### New global

- `ai_profile` — brand voice, do-not-say list, approved phrases, image style

### Extended collections

| Collection      | New columns (all nullable / defaulted)                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `users`         | `role` enum extended; `memberships` virtual relation; `phone`, `avatar`                                                       |
| `pages`         | full `seo` group, `status` (draft/published), `pageType`, `hero`, `sections` blocks, `faq`, `internalLinks`                   |
| `services`      | `category` enum (12 values), `targetCustomers`, `popularAddOns`, `warrantyNotes`, `relatedServices`, `cta`, full `seo` group  |
| `geo-pages`     | `county`, `services` relation, `nearbyAreas`, `localProof`, `faq`, `internalLinks`, full `seo` group                          |
| `media`         | `vehicleType`, `location` relation, `beforeAfter` tag, `aiCaption`, `aiTags`, `aiAltText` (read-only)                         |
| `leads`         | `status` enum (new/contacted/quoted/scheduled/won/lost), `priority`, `assignedTo` user relation, `notes` array                |
| `testimonials`  | `organization` relation                                                                                                       |
| `faqs`          | `organization` relation                                                                                                       |
| `quotes`        | `organization` relation                                                                                                       |

`organization` is **always nullable** at the schema level so existing rows
remain valid. New rows get their org auto-populated from the active user's
primary membership via the `defaultOrgOnCreate` hook in
`src/payload/utils/orgScope.ts`.

## What does NOT change

- The Payload `/admin` UI is untouched and remains available.
- Existing `/api/public/*` endpoints (faqs, gallery, geo-pages, services,
  settings, submit-lead, testimonials) keep their current request and
  response shape.
- The static site (`capital-upfitters-d2y6.vercel.app`) keeps rendering its
  hardcoded HTML; CMS data is layered on top opportunistically.
- No fields were removed and no enum values were dropped.

## Deployment steps

1. **Deploy the branch** — Payload + the Postgres adapter will detect the
   schema diff and emit migration SQL on first cold start.
   For Vercel Postgres / Neon, run the migration via `payload migrate` against
   the production DB before flipping traffic, to avoid running DDL inside a
   serverless cold start:

   ```bash
   DATABASE_URL=... npx payload migrate
   ```

2. **Seed the org + owner** (one-time per environment):

   ```bash
   DATABASE_URL=... \
   SEED_OWNER_EMAIL=admin@capitalupfitters.com \
   SEED_OWNER_PASSWORD=<strong-password> \
   npx tsx src/payload/seed/seed.ts
   ```

   The seed script is **idempotent** — running it twice produces the same
   result. See `SEED.md` for what it creates.

3. **Backfill `organization` on existing rows** (optional but recommended).
   Once the org exists, run a one-shot SQL update:

   ```sql
   UPDATE pages         SET organization_id = '<org-uuid>' WHERE organization_id IS NULL;
   UPDATE services      SET organization_id = '<org-uuid>' WHERE organization_id IS NULL;
   UPDATE geo_pages     SET organization_id = '<org-uuid>' WHERE organization_id IS NULL;
   UPDATE media         SET organization_id = '<org-uuid>' WHERE organization_id IS NULL;
   UPDATE leads         SET organization_id = '<org-uuid>' WHERE organization_id IS NULL;
   UPDATE testimonials  SET organization_id = '<org-uuid>' WHERE organization_id IS NULL;
   UPDATE faqs          SET organization_id = '<org-uuid>' WHERE organization_id IS NULL;
   UPDATE quotes        SET organization_id = '<org-uuid>' WHERE organization_id IS NULL;
   ```

   Until backfilled, rows with a `NULL` org are visible to all users; this is
   intentional for a clean cutover.

4. **Update the static site** to point at the canonical CMS URL — already
   handled in the parallel PR on `1vank0/CapitalUpfittersWeb` branch
   `feat/portal-cms-wiring`.

## Rollback

Schema changes are additive, so a code-only rollback is safe — the new
columns simply go unread. Dropping the new tables / columns requires a
manual migration:

```sql
DROP TABLE org_memberships;
DROP TABLE organizations;
DROP TABLE content_blocks;
DROP TABLE ai_profile;
ALTER TABLE pages         DROP COLUMN organization_id, DROP COLUMN page_type, DROP COLUMN status;
ALTER TABLE services      DROP COLUMN organization_id, DROP COLUMN category;
-- etc.
```

There is no need for a rollback in the common case.
