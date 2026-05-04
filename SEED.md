# Seeding the Upfit Portal

The seed script creates the first organization, an owner user, the full
service catalog, the DMV city pages, default content blocks, and the AI
brand profile. It is **idempotent** — running it twice produces the same
final state.

## Run it

```bash
# Local (sqlite or any DATABASE_URL)
SEED_OWNER_EMAIL=admin@capitalupfitters.com \
SEED_OWNER_PASSWORD=<strong-password> \
SEED_OWNER_NAME="Capital Upfitters Owner" \
npx payload run src/payload/seed/seed.ts

# Vercel / production
DATABASE_URL=postgres://... \
SEED_OWNER_EMAIL=... \
SEED_OWNER_PASSWORD=... \
npx payload run src/payload/seed/seed.ts
```

If the env vars are not set, the script falls back to `admin@capitalupfitters.com`
/ `admin` for **dev only** — change the password before any production run.

## What it creates

### Organization

- **Capital Upfitters** (slug `capital-upfitters`) — primary tenant, owns
  every other record below.

### Owner user

- Email + password from `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD`
- Role: `owner`
- An `OrgMembership` row connecting the user to the Capital Upfitters org

### 12 services (matching the project spec)

| Slug                  | Category          | Display name                          |
| --------------------- | ----------------- | ------------------------------------- |
| `bedliner`            | `bedliners`       | Spray-In Bedliner (Patriot Liner)     |
| `hitches`             | `hitches`         | Hitches & Towing                      |
| `undercoating`        | `undercoating`    | Undercoating & Rust Protection        |
| `ceramic-coating`     | `ceramic-ppf`     | Ceramic Coating & PPF                 |
| `truck-accessories`   | `accessories`     | Truck Accessories                     |
| `tonneau`             | `tonneau`         | Tonneau Covers                        |
| `running-boards`      | `running-boards`  | Running Boards & Steps                |
| `van-upfits`          | `van-upfits`      | Commercial Van Upfits                 |
| `fleet`               | `fleet`           | Fleet Upfitting                       |
| `dealer`              | `dealer`          | Dealer Services                       |
| `government`          | `government`      | Government / Municipal Services       |
| `industrial-coatings` | `industrial`      | Industrial Protective Coatings        |

### 11 DMV city pages (`geo-pages`)

Maryland: Rockville, Bethesda, Silver Spring, Gaithersburg, Germantown,
Potomac, Frederick.
DC: Washington.
Virginia: Arlington, Alexandria, Fairfax.

Each city page gets a state, county, slug, hero headline, and a local intro
paragraph.

### 9 reusable content blocks

- Homepage Hero
- Standard CTA — Get a Quote
- Fleet CTA
- Dealer / Gov CTA
- Why Choose Us — 4 reasons (`service-card`)
- Common FAQ — Retail
- Featured Gallery — Trucks
- Pricing Tiers — Bedliners
- Comparison — Patriot Liner vs Drop-In

### AI Profile global

Brand voice (confident, plain-spoken, no fluff), do-not-say list, approved
phrases, target cities, warranty + pricing rules, image generation style.
No model calls are wired yet — the values exist as a single grounding source
for future "AI write a draft" actions.

## Re-running

The script uses `findOrCreate(payload, collection, matchField, matchValue, ...)`
for every record, so a second run logs `· exists:` lines instead of creating
duplicates. This makes the script safe to bake into deploys if you ever want
infrastructure-as-code seeding.

## Resetting

To start over (destructive):

```sql
DELETE FROM org_memberships;
DELETE FROM organizations WHERE slug = 'capital-upfitters';
DELETE FROM users WHERE email = 'admin@capitalupfitters.com';
DELETE FROM services;
DELETE FROM geo_pages;
DELETE FROM content_blocks;
```

Then re-run the seed command.
