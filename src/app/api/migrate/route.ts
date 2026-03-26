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
      await drizzle.execute(`
        DROP TABLE IF EXISTS "settings_stats_items" CASCADE;
        DROP TABLE IF EXISTS "settings_rels" CASCADE;
        DROP TABLE IF EXISTS "settings" CASCADE;
        DROP TABLE IF EXISTS "account_requests" CASCADE;
        DROP TABLE IF EXISTS "quotes_line_items" CASCADE;
        DROP TABLE IF EXISTS "quotes_rels" CASCADE;
        DROP TABLE IF EXISTS "quotes" CASCADE;
        DROP TABLE IF EXISTS "leads" CASCADE;
        DROP TABLE IF EXISTS "faqs_audience" CASCADE;
        DROP TABLE IF EXISTS "faqs_rels" CASCADE;
        DROP TABLE IF EXISTS "faqs" CASCADE;
        DROP TABLE IF EXISTS "testimonials" CASCADE;
        DROP TABLE IF EXISTS "tags" CASCADE;
        DROP TABLE IF EXISTS "geo_pages_nearby_areas" CASCADE;
        DROP TABLE IF EXISTS "geo_pages_rels" CASCADE;
        DROP TABLE IF EXISTS "geo_pages" CASCADE;
        DROP TABLE IF EXISTS "pages_sections" CASCADE;
        DROP TABLE IF EXISTS "pages_rels" CASCADE;
        DROP TABLE IF EXISTS "pages" CASCADE;
        DROP TABLE IF EXISTS "services_audience" CASCADE;
        DROP TABLE IF EXISTS "services_gallery_images" CASCADE;
        DROP TABLE IF EXISTS "services_features" CASCADE;
        DROP TABLE IF EXISTS "services_faq_items" CASCADE;
        DROP TABLE IF EXISTS "services_rels" CASCADE;
        DROP TABLE IF EXISTS "services" CASCADE;
        DROP TABLE IF EXISTS "media" CASCADE;
        DROP TABLE IF EXISTS "payload_kv" CASCADE;
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

    // Run every statement individually and track results
    const run = async (label: string, sql: string) => {
      try {
        await drizzle.execute(sql)
      } catch (e: unknown) {
        const msg = String(e).substring(0, 150)
        if (!msg.includes('already exists') && !msg.includes('duplicate')) {
          results.push(`⚠️ ${label}: ${msg}`)
        }
      }
    }

    // CORE SYSTEM TABLES
    await run('ext', `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)

    await run('users', `CREATE TABLE IF NOT EXISTS "users" (
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
    )`)
    await run('users_email_idx', `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email")`)

    await run('users_sessions', `CREATE TABLE IF NOT EXISTS "users_sessions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "created_at" timestamp(3) with time zone,
      "expires_at" timestamp(3) with time zone
    )`)

    await run('payload_preferences', `CREATE TABLE IF NOT EXISTS "payload_preferences" (
      "id" serial PRIMARY KEY,
      "key" varchar,
      "value" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)

    await run('payload_preferences_rels', `CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
      "id" serial PRIMARY KEY,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "payload_preferences"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "users_id" integer REFERENCES "users"("id") ON DELETE CASCADE
    )`)

    await run('payload_migrations', `CREATE TABLE IF NOT EXISTS "payload_migrations" (
      "id" serial PRIMARY KEY,
      "name" varchar,
      "batch" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)

    await run('payload_locked_documents', `CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
      "id" serial PRIMARY KEY,
      "global_slug" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)

    // payload_locked_documents_rels — MOVED to after all collection tables are created (FK dependency)

    await run('payload_kv', `CREATE TABLE IF NOT EXISTS "payload_kv" (
      "id" serial PRIMARY KEY,
      "key" varchar NOT NULL,
      "value" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)
    await run('payload_kv_key_idx', `CREATE UNIQUE INDEX IF NOT EXISTS "payload_kv_key_idx" ON "payload_kv" ("key")`)

    // MEDIA — with image sizes columns (thumbnail, card, hero)
    await run('media', `CREATE TABLE IF NOT EXISTS "media" (
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
      "focal_y" numeric,
      "sizes_thumbnail_url" varchar,
      "sizes_thumbnail_width" numeric,
      "sizes_thumbnail_height" numeric,
      "sizes_thumbnail_mime_type" varchar,
      "sizes_thumbnail_filesize" numeric,
      "sizes_thumbnail_filename" varchar,
      "sizes_card_url" varchar,
      "sizes_card_width" numeric,
      "sizes_card_height" numeric,
      "sizes_card_mime_type" varchar,
      "sizes_card_filesize" numeric,
      "sizes_card_filename" varchar,
      "sizes_hero_url" varchar,
      "sizes_hero_width" numeric,
      "sizes_hero_height" numeric,
      "sizes_hero_mime_type" varchar,
      "sizes_hero_filesize" numeric,
      "sizes_hero_filename" varchar
    )`)
    await run('media_filename_idx', `CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" ("filename")`)

    // TAGS
    await run('tags', `CREATE TABLE IF NOT EXISTS "tags" (
      "id" serial PRIMARY KEY,
      "name" varchar NOT NULL,
      "type" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)

    // SERVICES — with turnaround, warranty, seo fields, active
    await run('services', `CREATE TABLE IF NOT EXISTS "services" (
      "id" serial PRIMARY KEY,
      "name" varchar NOT NULL,
      "slug" varchar,
      "category" varchar,
      "price_from" numeric,
      "price_to" numeric,
      "price_label" varchar,
      "tagline" varchar,
      "description" jsonb,
      "hero_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "turnaround" varchar,
      "warranty" varchar,
      "seo_meta_title" varchar,
      "seo_meta_description" varchar,
      "seo_keywords" varchar,
      "active" boolean DEFAULT true,
      "sort_order" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)
    await run('services_slug_idx', `CREATE UNIQUE INDEX IF NOT EXISTS "services_slug_idx" ON "services" ("slug")`)

    // SERVICES_AUDIENCE — uses "parent_id", "order" (not _parent_id, _order)
    await run('services_audience', `CREATE TABLE IF NOT EXISTS "services_audience" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "value" varchar
    )`)

    await run('services_features', `CREATE TABLE IF NOT EXISTS "services_features" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "feature" varchar
    )`)

    await run('services_faq_items', `CREATE TABLE IF NOT EXISTS "services_faq_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "question" varchar,
      "answer" varchar
    )`)

    await run('services_gallery_images', `CREATE TABLE IF NOT EXISTS "services_gallery_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "caption" varchar
    )`)

    await run('services_rels', `CREATE TABLE IF NOT EXISTS "services_rels" (
      "id" serial PRIMARY KEY,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "media_id" integer REFERENCES "media"("id") ON DELETE CASCADE
    )`)

    // PAGES — with seo_og_image_id
    await run('pages', `CREATE TABLE IF NOT EXISTS "pages" (
      "id" serial PRIMARY KEY,
      "title" varchar NOT NULL,
      "slug" varchar,
      "hero_headline" varchar,
      "hero_subtext" varchar,
      "hero_c_t_a_label" varchar,
      "hero_c_t_a_url" varchar,
      "seo_meta_title" varchar,
      "seo_meta_description" varchar,
      "seo_og_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)
    await run('pages_slug_idx', `CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" ("slug")`)

    // PAGES_SECTIONS — with "data" column for lateral join aggregation
    await run('pages_sections', `CREATE TABLE IF NOT EXISTS "pages_sections" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "section_type" varchar DEFAULT 'text',
      "headline" varchar,
      "subtext" varchar,
      "custom_h_t_m_l" varchar
    )`)

    await run('pages_rels', `CREATE TABLE IF NOT EXISTS "pages_rels" (
      "id" serial PRIMARY KEY,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "media_id" integer REFERENCES "media"("id") ON DELETE CASCADE
    )`)

    // GEO_PAGES
    await run('geo_pages', `CREATE TABLE IF NOT EXISTS "geo_pages" (
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
    )`)
    await run('geo_pages_slug_idx', `CREATE UNIQUE INDEX IF NOT EXISTS "geo_pages_slug_idx" ON "geo_pages" ("slug")`)

    await run('geo_pages_nearby_areas', `CREATE TABLE IF NOT EXISTS "geo_pages_nearby_areas" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "geo_pages"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "area" varchar
    )`)

    await run('geo_pages_rels', `CREATE TABLE IF NOT EXISTS "geo_pages_rels" (
      "id" serial PRIMARY KEY,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "geo_pages"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
    )`)

    // TESTIMONIALS
    await run('testimonials', `CREATE TABLE IF NOT EXISTS "testimonials" (
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
    )`)

    // FAQS — with service_id
    await run('faqs', `CREATE TABLE IF NOT EXISTS "faqs" (
      "id" serial PRIMARY KEY,
      "question" varchar NOT NULL,
      "answer" jsonb,
      "service_id" integer REFERENCES "services"("id") ON DELETE SET NULL,
      "sort_order" numeric DEFAULT 0,
      "active" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)

    // FAQS_AUDIENCE — uses "parent_id", "order" (not _parent_id, _order)
    await run('faqs_audience', `CREATE TABLE IF NOT EXISTS "faqs_audience" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL REFERENCES "faqs"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "value" varchar
    )`)

    await run('faqs_rels', `CREATE TABLE IF NOT EXISTS "faqs_rels" (
      "id" serial PRIMARY KEY,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "faqs"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
    )`)

    // LEADS — with ai_summary fields
    await run('leads', `CREATE TABLE IF NOT EXISTS "leads" (
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
      "ai_summary_price_estimate" varchar,
      "ai_summary_timeline_estimate" varchar,
      "ai_summary_personalized_message" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)

    // QUOTES — with lead_id
    await run('quotes', `CREATE TABLE IF NOT EXISTS "quotes" (
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
    )`)

    // QUOTES_LINE_ITEMS — with service_id
    await run('quotes_line_items', `CREATE TABLE IF NOT EXISTS "quotes_line_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "quotes"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "service_id" integer REFERENCES "services"("id") ON DELETE SET NULL,
      "description" varchar,
      "price" numeric
    )`)

    await run('quotes_rels', `CREATE TABLE IF NOT EXISTS "quotes_rels" (
      "id" serial PRIMARY KEY,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "quotes"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
    )`)

    // ACCOUNT_REQUESTS
    await run('account_requests', `CREATE TABLE IF NOT EXISTS "account_requests" (
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
    )`)

    // payload_locked_documents_rels — here AFTER all collection tables exist (all FKs can resolve)
    await run('payload_locked_documents_rels', `CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
      "id" serial PRIMARY KEY,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "payload_locked_documents"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE,
      "pages_id" integer REFERENCES "pages"("id") ON DELETE CASCADE,
      "geo_pages_id" integer REFERENCES "geo_pages"("id") ON DELETE CASCADE,
      "media_id" integer REFERENCES "media"("id") ON DELETE CASCADE,
      "testimonials_id" integer REFERENCES "testimonials"("id") ON DELETE CASCADE,
      "faqs_id" integer REFERENCES "faqs"("id") ON DELETE CASCADE,
      "tags_id" integer REFERENCES "tags"("id") ON DELETE CASCADE,
      "leads_id" integer REFERENCES "leads"("id") ON DELETE CASCADE,
      "quotes_id" integer REFERENCES "quotes"("id") ON DELETE CASCADE,
      "account_requests_id" integer REFERENCES "account_requests"("id") ON DELETE CASCADE,
      "users_id" integer REFERENCES "users"("id") ON DELETE CASCADE
    )`)

    // SETTINGS — no special char defaults
    await run('settings', `CREATE TABLE IF NOT EXISTS "settings" (
      "id" serial PRIMARY KEY,
      "business_name" varchar,
      "contact_phone" varchar,
      "contact_email" varchar,
      "contact_address" varchar,
      "contact_full_address" varchar,
      "hours_weekdays" varchar,
      "hours_saturday" varchar,
      "hours_sunday" varchar,
      "social_facebook" varchar,
      "social_instagram" varchar,
      "social_youtube" varchar,
      "social_google" varchar,
      "seo_default_title" varchar,
      "seo_default_description" varchar,
      "seo_default_og_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "urgency_enabled" boolean DEFAULT true,
      "urgency_message1" varchar,
      "urgency_message2" varchar,
      "portal_url" varchar,
      "portal_register_url" varchar,
      "portal_login_url" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)

    // SETTINGS_STATS_ITEMS — stats.items array from Settings.ts (was missing from CREATE list)
    await run('settings_stats_items', `CREATE TABLE IF NOT EXISTS "settings_stats_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "settings"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "value" varchar,
      "label" varchar
    )`)

    await run('settings_rels', `CREATE TABLE IF NOT EXISTS "settings_rels" (
      "id" serial PRIMARY KEY,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "settings"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "media_id" integer REFERENCES "media"("id") ON DELETE CASCADE
    )`)

    await run('settings_insert', `INSERT INTO "settings" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING`)

    results.push('All tables created')

    // Verify all collections work
    for (const slug of ['users', 'services', 'leads', 'account-requests', 'media', 'pages', 'geo-pages', 'testimonials', 'faqs', 'tags', 'quotes']) {
      try {
        const r = await payload.find({ collection: slug as any, limit: 1, overrideAccess: true })
        results.push(`✅ ${slug}: OK`)
      } catch (e: unknown) {
        const cause = (e as any)?.cause?.message || (e instanceof Error ? e.message : String(e))
        results.push(`❌ ${slug}: ${String(cause).substring(0, 150)}`)
      }
    }

    // Test settings global
    try {
      await payload.findGlobal({ slug: 'settings', overrideAccess: true })
      results.push('✅ settings global: OK')
    } catch (e: unknown) {
      const cause = (e as any)?.cause?.message || (e instanceof Error ? e.message : String(e))
      results.push(`❌ settings global: ${String(cause).substring(0, 150)}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    results.push('FATAL: ' + msg.substring(0, 400))
    return NextResponse.json({ success: false, results, error: msg }, { status: 500 })
  }
}
