import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const fresh = searchParams.get('fresh') === '1'

  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    const payload = await getPayload({ config })
    const db = payload.db as any
    const drizzle = db.drizzle

    results.push('Connected: ' + (process.env.DATABASE_URL || '').replace(/:([^@]+)@/, ':***@').substring(0, 60))

    // DROP all tables if fresh=1
    if (fresh) {
      results.push('Dropping all tables...')
      await drizzle.execute(`
        DROP TABLE IF EXISTS "account_requests" CASCADE;
        DROP TABLE IF EXISTS "quotes_line_items" CASCADE;
        DROP TABLE IF EXISTS "quotes_rels" CASCADE;
        DROP TABLE IF EXISTS "quotes" CASCADE;
        DROP TABLE IF EXISTS "leads" CASCADE;
        DROP TABLE IF EXISTS "faqs_rels" CASCADE;
        DROP TABLE IF EXISTS "faqs" CASCADE;
        DROP TABLE IF EXISTS "testimonials_rels" CASCADE;
        DROP TABLE IF EXISTS "testimonials" CASCADE;
        DROP TABLE IF EXISTS "tags" CASCADE;
        DROP TABLE IF EXISTS "geo_pages_nearby_areas" CASCADE;
        DROP TABLE IF EXISTS "geo_pages_rels" CASCADE;
        DROP TABLE IF EXISTS "geo_pages" CASCADE;
        DROP TABLE IF EXISTS "pages_sections" CASCADE;
        DROP TABLE IF EXISTS "pages_rels" CASCADE;
        DROP TABLE IF EXISTS "pages" CASCADE;
        DROP TABLE IF EXISTS "services_features" CASCADE;
        DROP TABLE IF EXISTS "services_faq_items" CASCADE;
        DROP TABLE IF EXISTS "services_rels" CASCADE;
        DROP TABLE IF EXISTS "services" CASCADE;
        DROP TABLE IF EXISTS "media" CASCADE;
        DROP TABLE IF EXISTS "settings" CASCADE;
        DROP TABLE IF EXISTS "payload_locked_documents_rels" CASCADE;
        DROP TABLE IF EXISTS "payload_locked_documents" CASCADE;
        DROP TABLE IF EXISTS "payload_preferences_rels" CASCADE;
        DROP TABLE IF EXISTS "payload_preferences" CASCADE;
        DROP TABLE IF EXISTS "payload_migrations" CASCADE;
        DROP TABLE IF EXISTS "users_sessions" CASCADE;
        DROP TABLE IF EXISTS "users" CASCADE;
      `)
      results.push('All tables dropped')
    }

    // Create tables matching EXACT Payload drizzle column names (snake_case from camelCase fields)
    const statements = [
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

      // USERS
      `CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY,
        "name" varchar,
        "role" varchar DEFAULT 'editor',
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "email" varchar NOT NULL,
        "reset_password_token" varchar,
        "reset_password_expiration" timestamp(3) with time zone,
        "salt" varchar,
        "hash" varchar,
        "login_attempts" numeric DEFAULT 0,
        "lock_until" timestamp(3) with time zone
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email")`,
      `CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" ("updated_at")`,
      `CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" ("created_at")`,

      // USERS_SESSIONS
      `CREATE TABLE IF NOT EXISTS "users_sessions" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "created_at" timestamp(3) with time zone,
        "expires_at" timestamp(3) with time zone
      )`,
      `CREATE INDEX IF NOT EXISTS "users_sessions_order_idx" ON "users_sessions" ("_order")`,
      `CREATE INDEX IF NOT EXISTS "users_sessions_parent_id_idx" ON "users_sessions" ("_parent_id")`,

      // PAYLOAD SYSTEM
      `CREATE TABLE IF NOT EXISTS "payload_preferences" (
        "id" serial PRIMARY KEY,
        "key" varchar,
        "value" jsonb,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" ("key")`,

      `CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "payload_preferences"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "users_id" integer REFERENCES "users"("id") ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" ("parent_id")`,

      `CREATE TABLE IF NOT EXISTS "payload_migrations" (
        "id" serial PRIMARY KEY,
        "name" varchar,
        "batch" numeric,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
        "id" serial PRIMARY KEY,
        "global_slug" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "payload_locked_documents"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "users_id" integer REFERENCES "users"("id") ON DELETE CASCADE
      )`,

      // MEDIA — columns match Media.ts field names (alt, category, vehicle_type, caption, featured, show_in_gallery)
      `CREATE TABLE IF NOT EXISTS "media" (
        "id" serial PRIMARY KEY,
        "alt" varchar,
        "category" varchar,
        "vehicle_type" varchar,
        "caption" varchar,
        "featured" boolean DEFAULT false,
        "show_in_gallery" boolean DEFAULT true,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "url" varchar,
        "thumbnail_u_r_l" varchar,
        "filename" varchar,
        "mime_type" varchar,
        "filesize" numeric,
        "width" numeric,
        "height" numeric,
        "focal_x" numeric,
        "focal_y" numeric
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" ("filename")`,
      `CREATE INDEX IF NOT EXISTS "media_updated_at_idx" ON "media" ("updated_at")`,

      // TAGS — name, type
      `CREATE TABLE IF NOT EXISTS "tags" (
        "id" serial PRIMARY KEY,
        "name" varchar NOT NULL,
        "type" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS "tags_updated_at_idx" ON "tags" ("updated_at")`,

      // SERVICES — name, slug, category, audience, price_from, price_to, price_label, tagline, description, hero_image_id
      `CREATE TABLE IF NOT EXISTS "services" (
        "id" serial PRIMARY KEY,
        "name" varchar NOT NULL,
        "slug" varchar,
        "category" varchar,
        "audience" varchar,
        "price_from" numeric,
        "price_to" numeric,
        "price_label" varchar,
        "tagline" varchar,
        "description" jsonb,
        "hero_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
        "is_featured" boolean DEFAULT false,
        "is_active" boolean DEFAULT true,
        "sort_order" numeric DEFAULT 0,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "services_slug_idx" ON "services" ("slug")`,
      `CREATE INDEX IF NOT EXISTS "services_updated_at_idx" ON "services" ("updated_at")`,

      // SERVICES_FEATURES — feature text
      `CREATE TABLE IF NOT EXISTS "services_features" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "feature" varchar
      )`,
      `CREATE INDEX IF NOT EXISTS "services_features_parent_idx" ON "services_features" ("_parent_id")`,

      // SERVICES_FAQ_ITEMS
      `CREATE TABLE IF NOT EXISTS "services_faq_items" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "question" varchar,
        "answer" varchar
      )`,
      `CREATE INDEX IF NOT EXISTS "services_faq_items_parent_idx" ON "services_faq_items" ("_parent_id")`,

      // PAGES — title, slug, hero_headline, hero_subtext, seo group
      `CREATE TABLE IF NOT EXISTS "pages" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "slug" varchar,
        "hero_headline" varchar,
        "hero_subtext" varchar,
        "hero_c_t_a_label" varchar,
        "hero_c_t_a_url" varchar,
        "seo_meta_title" varchar,
        "seo_meta_description" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" ("slug")`,
      `CREATE INDEX IF NOT EXISTS "pages_updated_at_idx" ON "pages" ("updated_at")`,

      // PAGES_SECTIONS
      `CREATE TABLE IF NOT EXISTS "pages_sections" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "section_type" varchar DEFAULT 'text',
        "headline" varchar,
        "subtext" varchar,
        "custom_h_t_m_l" varchar
      )`,
      `CREATE INDEX IF NOT EXISTS "pages_sections_parent_idx" ON "pages_sections" ("_parent_id")`,

      // PAGES_RELS (for ogImage upload relation)
      `CREATE TABLE IF NOT EXISTS "pages_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "media_id" integer REFERENCES "media"("id") ON DELETE CASCADE
      )`,

      // GEO_PAGES — city, state, slug, hero_headline, local_intro, coordinates (group), seo (group)
      `CREATE TABLE IF NOT EXISTS "geo_pages" (
        "id" serial PRIMARY KEY,
        "city" varchar NOT NULL,
        "state" varchar DEFAULT 'MD',
        "slug" varchar,
        "hero_headline" varchar,
        "local_intro" varchar,
        "coordinates_lat" numeric,
        "coordinates_lng" numeric,
        "seo_meta_title" varchar,
        "seo_meta_description" varchar,
        "seo_h1" varchar,
        "seo_keywords" varchar,
        "active" boolean DEFAULT true,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "geo_pages_slug_idx" ON "geo_pages" ("slug")`,
      `CREATE INDEX IF NOT EXISTS "geo_pages_updated_at_idx" ON "geo_pages" ("updated_at")`,

      // GEO_PAGES_NEARBY_AREAS
      `CREATE TABLE IF NOT EXISTS "geo_pages_nearby_areas" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "geo_pages"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "area" varchar
      )`,
      `CREATE INDEX IF NOT EXISTS "geo_pages_nearby_areas_parent_idx" ON "geo_pages_nearby_areas" ("_parent_id")`,

      // GEO_PAGES_RELS (for services relationship)
      `CREATE TABLE IF NOT EXISTS "geo_pages_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "geo_pages"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
      )`,

      // TESTIMONIALS — customer_name, customer_title, quote, rating, audience, source, source_url, featured, active
      `CREATE TABLE IF NOT EXISTS "testimonials" (
        "id" serial PRIMARY KEY,
        "customer_name" varchar NOT NULL,
        "customer_title" varchar,
        "quote" varchar NOT NULL,
        "rating" varchar DEFAULT '5',
        "audience" varchar,
        "source" varchar DEFAULT 'google',
        "source_url" varchar,
        "featured" boolean DEFAULT false,
        "active" boolean DEFAULT true,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS "testimonials_updated_at_idx" ON "testimonials" ("updated_at")`,

      // TESTIMONIALS_RELS (service relationship)
      `CREATE TABLE IF NOT EXISTS "testimonials_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "testimonials"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
      )`,

      // FAQS — question, answer (richText=jsonb), sort_order, active
      `CREATE TABLE IF NOT EXISTS "faqs" (
        "id" serial PRIMARY KEY,
        "question" varchar NOT NULL,
        "answer" jsonb,
        "sort_order" numeric DEFAULT 0,
        "active" boolean DEFAULT true,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS "faqs_updated_at_idx" ON "faqs" ("updated_at")`,

      // FAQS_RELS (service + audience relationships)
      `CREATE TABLE IF NOT EXISTS "faqs_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "faqs"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
      )`,

      // LEADS — ref_id, lead_type, status, name, phone, email, company, service, vehicle_year, vehicle_make, message, fleet_size, source, internal_notes, assigned_to, follow_up_date
      `CREATE TABLE IF NOT EXISTS "leads" (
        "id" serial PRIMARY KEY,
        "ref_id" varchar,
        "lead_type" varchar DEFAULT 'general',
        "status" varchar DEFAULT 'new',
        "name" varchar NOT NULL,
        "phone" varchar,
        "email" varchar,
        "company" varchar,
        "service" varchar,
        "vehicle_year" varchar,
        "vehicle_make" varchar,
        "message" varchar,
        "fleet_size" numeric,
        "source" varchar DEFAULT 'website',
        "internal_notes" varchar,
        "assigned_to" varchar,
        "follow_up_date" timestamp(3) with time zone,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS "leads_updated_at_idx" ON "leads" ("updated_at")`,

      // QUOTES — ref_id, status, subtotal, discount, total_estimate, valid_until, notes
      `CREATE TABLE IF NOT EXISTS "quotes" (
        "id" serial PRIMARY KEY,
        "ref_id" varchar,
        "status" varchar DEFAULT 'draft',
        "subtotal" numeric,
        "discount" numeric DEFAULT 0,
        "total_estimate" numeric,
        "valid_until" timestamp(3) with time zone,
        "notes" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS "quotes_updated_at_idx" ON "quotes" ("updated_at")`,

      // QUOTES_LINE_ITEMS
      `CREATE TABLE IF NOT EXISTS "quotes_line_items" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "quotes"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "description" varchar,
        "price" numeric
      )`,
      `CREATE INDEX IF NOT EXISTS "quotes_line_items_parent_idx" ON "quotes_line_items" ("_parent_id")`,

      // QUOTES_RELS (lead + service relationships)
      `CREATE TABLE IF NOT EXISTS "quotes_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "quotes"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "leads_id" integer REFERENCES "leads"("id") ON DELETE CASCADE,
        "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
      )`,

      // ACCOUNT_REQUESTS — name, email, company, reason, requested_role, status, admin_note, ip_address
      `CREATE TABLE IF NOT EXISTS "account_requests" (
        "id" serial PRIMARY KEY,
        "name" varchar NOT NULL,
        "email" varchar NOT NULL,
        "company" varchar,
        "reason" varchar,
        "requested_role" varchar DEFAULT 'editor',
        "status" varchar DEFAULT 'pending',
        "admin_note" varchar,
        "ip_address" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "account_requests_email_idx" ON "account_requests" ("email")`,

      // SETTINGS GLOBAL — all fields from Settings.ts with correct snake_case names
      `CREATE TABLE IF NOT EXISTS "settings" (
        "id" serial PRIMARY KEY,
        "business_name" varchar DEFAULT 'Capital Upfitters',
        "contact_phone" varchar DEFAULT '(301) 555-0100',
        "contact_email" varchar,
        "contact_address" varchar DEFAULT 'Rockville, MD',
        "contact_full_address" varchar,
        "hours_weekdays" varchar DEFAULT 'Mon–Fri: 8am–5pm',
        "hours_saturday" varchar DEFAULT 'Sat: 9am–2pm',
        "hours_sunday" varchar DEFAULT 'Closed',
        "social_facebook" varchar,
        "social_instagram" varchar,
        "social_youtube" varchar,
        "social_google" varchar,
        "seo_default_title" varchar DEFAULT 'Capital Upfitters | Vehicle Upfitting Rockville MD',
        "seo_default_description" varchar,
        "urgency_enabled" boolean DEFAULT true,
        "urgency_message1" varchar DEFAULT 'Same-week appointments available — call now',
        "urgency_message2" varchar DEFAULT 'Fleet pricing available — no minimums',
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `INSERT INTO "settings" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING`,

      // SETTINGS_RELS (for seo_default_og_image upload)
      `CREATE TABLE IF NOT EXISTS "settings_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "settings"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "media_id" integer REFERENCES "media"("id") ON DELETE CASCADE
      )`,
    ]

    let ok = 0, skipped = 0
    for (const sql of statements) {
      try {
        await drizzle.execute(sql)
        ok++
      } catch (e: unknown) {
        const msg = String(e).substring(0, 150)
        if (!msg.includes('already exists')) {
          results.push(`⚠️ ${msg}`)
        }
        skipped++
      }
    }

    results.push(`Ran ${statements.length} statements — ${ok} OK, ${skipped} skipped/errors`)

    // Verify key tables
    for (const table of ['users', 'services', 'leads', 'testimonials', 'account_requests', 'settings']) {
      try {
        const check = await drizzle.execute(`SELECT COUNT(*) as cnt FROM "${table}"`)
        results.push(`✅ ${table}: ${check.rows?.[0]?.cnt} rows`)
      } catch {
        results.push(`❌ ${table}: missing`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, results, error: message.substring(0, 500) }, { status: 500 })
  }
}
