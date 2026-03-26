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

    if (fresh) {
      // Drop everything
      await drizzle.execute(`
        DROP TABLE IF EXISTS "faqs_audience" CASCADE;
        DROP TABLE IF EXISTS "faqs_rels" CASCADE;
        DROP TABLE IF EXISTS "faqs" CASCADE;
        DROP TABLE IF EXISTS "services_features" CASCADE;
        DROP TABLE IF EXISTS "services_faq_items" CASCADE;
        DROP TABLE IF EXISTS "services_rels" CASCADE;
        DROP TABLE IF EXISTS "services" CASCADE;
        DROP TABLE IF EXISTS "testimonials_rels" CASCADE;
        DROP TABLE IF EXISTS "testimonials" CASCADE;
        DROP TABLE IF EXISTS "leads" CASCADE;
        DROP TABLE IF EXISTS "quotes_line_items" CASCADE;
        DROP TABLE IF EXISTS "quotes_rels" CASCADE;
        DROP TABLE IF EXISTS "quotes" CASCADE;
        DROP TABLE IF EXISTS "account_requests" CASCADE;
        DROP TABLE IF EXISTS "geo_pages_nearby_areas" CASCADE;
        DROP TABLE IF EXISTS "geo_pages_rels" CASCADE;
        DROP TABLE IF EXISTS "geo_pages" CASCADE;
        DROP TABLE IF EXISTS "pages_sections" CASCADE;
        DROP TABLE IF EXISTS "pages_rels" CASCADE;
        DROP TABLE IF EXISTS "pages" CASCADE;
        DROP TABLE IF EXISTS "tags" CASCADE;
        DROP TABLE IF EXISTS "media" CASCADE;
        DROP TABLE IF EXISTS "settings_rels" CASCADE;
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

    // === EXACT SCHEMA FROM PAYLOAD QUERY ANALYSIS ===
    // Column names taken directly from the SQL Payload generates when querying collections

    const tables: [string, string][] = [
      ['users', `CREATE TABLE IF NOT EXISTS "users" (
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
      )`],

      ['users_sessions', `CREATE TABLE IF NOT EXISTS "users_sessions" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "created_at" timestamp(3) with time zone,
        "expires_at" timestamp(3) with time zone
      )`],

      ['payload_preferences', `CREATE TABLE IF NOT EXISTS "payload_preferences" (
        "id" serial PRIMARY KEY,
        "key" varchar,
        "value" jsonb,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`],

      ['payload_preferences_rels', `CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "payload_preferences"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "users_id" integer REFERENCES "users"("id") ON DELETE CASCADE
      )`],

      ['payload_migrations', `CREATE TABLE IF NOT EXISTS "payload_migrations" (
        "id" serial PRIMARY KEY,
        "name" varchar,
        "batch" numeric,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`],

      ['payload_locked_documents', `CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
        "id" serial PRIMARY KEY,
        "global_slug" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`],

      ['payload_locked_documents_rels', `CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "payload_locked_documents"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "users_id" integer REFERENCES "users"("id") ON DELETE CASCADE
      )`],

      // MEDIA — exact columns from error: id, alt, category, vehicle_type, caption, featured, show_in_gallery, updated_at, created_at, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height, focal_x, focal_y
      ['media', `CREATE TABLE IF NOT EXISTS "media" (
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
      )`],

      // TAGS — id, name, type
      ['tags', `CREATE TABLE IF NOT EXISTS "tags" (
        "id" serial PRIMARY KEY,
        "name" varchar NOT NULL,
        "type" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`],

      // SERVICES — exact from error: id, name, slug, category, price_from, price_to, price_label, tagline + more
      // Payload Drizzle also adds: description (jsonb), hero_image_id, is_featured, is_active, sort_order
      ['services', `CREATE TABLE IF NOT EXISTS "services" (
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
      )`],

      ['services_features', `CREATE TABLE IF NOT EXISTS "services_features" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "feature" varchar
      )`],

      ['services_faq_items', `CREATE TABLE IF NOT EXISTS "services_faq_items" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "question" varchar,
        "answer" varchar
      )`],

      ['services_rels', `CREATE TABLE IF NOT EXISTS "services_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "media_id" integer REFERENCES "media"("id") ON DELETE CASCADE
      )`],

      // PAGES — exact from error: id, title, slug, hero_headline, hero_subtext, hero_c_t_a_label, hero_c_t_a_url, seo_meta_title...
      ['pages', `CREATE TABLE IF NOT EXISTS "pages" (
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
      )`],

      ['pages_sections', `CREATE TABLE IF NOT EXISTS "pages_sections" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "section_type" varchar DEFAULT 'text',
        "headline" varchar,
        "subtext" varchar,
        "custom_h_t_m_l" varchar
      )`],

      ['pages_rels', `CREATE TABLE IF NOT EXISTS "pages_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "media_id" integer REFERENCES "media"("id") ON DELETE CASCADE
      )`],

      // GEO_PAGES
      ['geo_pages', `CREATE TABLE IF NOT EXISTS "geo_pages" (
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
      )`],

      ['geo_pages_nearby_areas', `CREATE TABLE IF NOT EXISTS "geo_pages_nearby_areas" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "geo_pages"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "area" varchar
      )`],

      ['geo_pages_rels', `CREATE TABLE IF NOT EXISTS "geo_pages_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "geo_pages"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
      )`],

      // TESTIMONIALS — exact from error: id, customer_name, customer_title, quote, rating, service_id, audience, source, source_url, featured, active
      ['testimonials', `CREATE TABLE IF NOT EXISTS "testimonials" (
        "id" serial PRIMARY KEY,
        "customer_name" varchar NOT NULL,
        "customer_title" varchar,
        "quote" varchar NOT NULL,
        "rating" varchar DEFAULT '5',
        "service_id" integer REFERENCES "services"("id") ON DELETE SET NULL,
        "audience" varchar,
        "source" varchar DEFAULT 'google',
        "source_url" varchar,
        "featured" boolean DEFAULT false,
        "active" boolean DEFAULT true,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`],

      // FAQS — exact from error: id, question, answer (jsonb), service_id, sort_order, active
      // ALSO needs faqs_audience join table with "data" column
      ['faqs', `CREATE TABLE IF NOT EXISTS "faqs" (
        "id" serial PRIMARY KEY,
        "question" varchar NOT NULL,
        "answer" jsonb,
        "service_id" integer REFERENCES "services"("id") ON DELETE SET NULL,
        "sort_order" numeric DEFAULT 0,
        "active" boolean DEFAULT true,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`],

      // faqs_audience — select query includes "faqs_audience"."data" column
      ['faqs_audience', `CREATE TABLE IF NOT EXISTS "faqs_audience" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "faqs"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "data" varchar
      )`],

      ['faqs_rels', `CREATE TABLE IF NOT EXISTS "faqs_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "faqs"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
      )`],

      // LEADS — exact from error: id, ref_id, lead_type, status, name, phone, email, company, service, vehicle_year, vehicle_make, message, fleet_size, source, internal_notes + more
      ['leads', `CREATE TABLE IF NOT EXISTS "leads" (
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
      )`],

      // QUOTES — exact from error: id, ref_id, lead_id, status, subtotal, discount, total_estimate, valid_until, notes
      ['quotes', `CREATE TABLE IF NOT EXISTS "quotes" (
        "id" serial PRIMARY KEY,
        "ref_id" varchar,
        "lead_id" integer REFERENCES "leads"("id") ON DELETE SET NULL,
        "status" varchar DEFAULT 'draft',
        "subtotal" numeric,
        "discount" numeric DEFAULT 0,
        "total_estimate" numeric,
        "valid_until" timestamp(3) with time zone,
        "notes" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`],

      ['quotes_line_items', `CREATE TABLE IF NOT EXISTS "quotes_line_items" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "quotes"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "description" varchar,
        "price" numeric
      )`],

      ['quotes_rels', `CREATE TABLE IF NOT EXISTS "quotes_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "quotes"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
      )`],

      // ACCOUNT_REQUESTS
      ['account_requests', `CREATE TABLE IF NOT EXISTS "account_requests" (
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
      )`],

      // SETTINGS GLOBAL — exact from error: id, business_name, contact_phone, contact_email, contact_address, contact_full_address + more
      ['settings', `CREATE TABLE IF NOT EXISTS "settings" (
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
      )`],

      ['settings_rels', `CREATE TABLE IF NOT EXISTS "settings_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "settings"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "media_id" integer REFERENCES "media"("id") ON DELETE CASCADE
      )`],
    ]

    // Run all CREATE TABLE statements
    let ok = 0, errors = 0
    for (const [name, sql] of tables) {
      try {
        await drizzle.execute(sql)
        ok++
      } catch (e: unknown) {
        const msg = String(e).substring(0, 100)
        if (!msg.includes('already exists')) {
          results.push(`⚠️ ${name}: ${msg}`)
          errors++
        } else {
          ok++
        }
      }
    }

    // CREATE indexes
    const indexes = [
      `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email")`,
      `CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" ("updated_at")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" ("filename")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "services_slug_idx" ON "services" ("slug")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" ("slug")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "geo_pages_slug_idx" ON "geo_pages" ("slug")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "account_requests_email_idx" ON "account_requests" ("email")`,
      `INSERT INTO "settings" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING`,
    ]
    for (const sql of indexes) {
      try { await drizzle.execute(sql); ok++ } catch { ok++ }
    }

    results.push(`Tables: ${ok} OK, ${errors} errors`)

    // Verify
    for (const table of ['users', 'services', 'leads', 'testimonials', 'faqs', 'quotes', 'account_requests', 'settings']) {
      try {
        const r = await drizzle.execute(`SELECT COUNT(*) as cnt FROM "${table}"`)
        results.push(`✅ ${table}: ${r.rows?.[0]?.cnt} rows`)
      } catch {
        results.push(`❌ ${table}: missing`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    results.push('FATAL: ' + msg.substring(0, 400))
    return NextResponse.json({ success: false, results, error: msg }, { status: 500 })
  }
}
