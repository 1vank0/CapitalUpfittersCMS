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

    // SERVICES_AUDIENCE — hasMany select; Payload expects id serial (auto-increment).
    // Previously created with id varchar which caused INSERTs to fail with `default` keyword.
    // Drop+recreate is safe because INSERTs failed (table is empty).
    // Conditional drop: only if id column is varchar (the bad schema). Safe re-run.
    await run('drop_services_audience_bad', `DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services_audience' AND column_name='id' AND data_type='character varying')
      THEN DROP TABLE "services_audience" CASCADE;
      END IF;
    END $$`)
    await run('services_audience', `CREATE TABLE IF NOT EXISTS "services_audience" (
      "id" serial PRIMARY KEY,
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
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

    // FAQS_AUDIENCE — hasMany select; same fix as services_audience.
    await run('drop_faqs_audience_bad', `DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='faqs_audience' AND column_name='id' AND data_type='character varying')
      THEN DROP TABLE "faqs_audience" CASCADE;
      END IF;
    END $$`)
    await run('faqs_audience', `CREATE TABLE IF NOT EXISTS "faqs_audience" (
      "id" serial PRIMARY KEY,
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL REFERENCES "faqs"("id") ON DELETE CASCADE,
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

    // ─────────────────────────────────────────────────────────────────────────
    // UPFIT PORTAL MULTI-TENANT SCHEMA — ADDITIVE MIGRATION
    // All statements are idempotent: IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
    // ─────────────────────────────────────────────────────────────────────────

    // ── 1. ORGANIZATIONS ────────────────────────────────────────────────────
    await run('organizations', `CREATE TABLE IF NOT EXISTS "organizations" (
      "id" serial PRIMARY KEY,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "type" varchar DEFAULT 'shop',
      "status" varchar DEFAULT 'active',
      "plan" varchar DEFAULT 'starter',
      "contact_phone" varchar,
      "contact_email" varchar,
      "contact_address" varchar,
      "contact_city" varchar,
      "contact_state" varchar,
      "contact_zip" varchar,
      "branding_primary_color" varchar DEFAULT '#203055',
      "branding_logo_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "branding_tagline" varchar,
      "primary_domain" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)
    await run('organizations_slug_idx', `CREATE UNIQUE INDEX IF NOT EXISTS "organizations_slug_idx" ON "organizations" ("slug")`)
    await run('organizations_updated_at_idx', `CREATE INDEX IF NOT EXISTS "organizations_updated_at_idx" ON "organizations" ("updated_at")`)
    await run('organizations_created_at_idx', `CREATE INDEX IF NOT EXISTS "organizations_created_at_idx" ON "organizations" ("created_at")`)

    // ── 2. ORG_MEMBERSHIPS ──────────────────────────────────────────────────
    await run('org_memberships', `CREATE TABLE IF NOT EXISTS "org_memberships" (
      "id" serial PRIMARY KEY,
      "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
      "organization_id" integer REFERENCES "organizations"("id") ON DELETE CASCADE,
      "role" varchar DEFAULT 'staff',
      "status" varchar DEFAULT 'active',
      "is_default" boolean DEFAULT false,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)
    await run('org_memberships_user_idx', `CREATE INDEX IF NOT EXISTS "org_memberships_user_idx" ON "org_memberships" ("user_id")`)
    await run('org_memberships_org_idx', `CREATE INDEX IF NOT EXISTS "org_memberships_org_idx" ON "org_memberships" ("organization_id")`)
    await run('org_memberships_updated_at_idx', `CREATE INDEX IF NOT EXISTS "org_memberships_updated_at_idx" ON "org_memberships" ("updated_at")`)
    await run('org_memberships_created_at_idx', `CREATE INDEX IF NOT EXISTS "org_memberships_created_at_idx" ON "org_memberships" ("created_at")`)

    // ── 3. CONTENT_BLOCKS ───────────────────────────────────────────────────
    await run('content_blocks', `CREATE TABLE IF NOT EXISTS "content_blocks" (
      "id" serial PRIMARY KEY,
      "organization_id" integer REFERENCES "organizations"("id") ON DELETE SET NULL,
      "name" varchar NOT NULL,
      "block_type" varchar NOT NULL,
      "headline" varchar,
      "subtext" text,
      "body" jsonb,
      "image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "cta_label" varchar,
      "cta_url" varchar,
      "meta" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)
    await run('content_blocks_org_idx', `CREATE INDEX IF NOT EXISTS "content_blocks_org_idx" ON "content_blocks" ("organization_id")`)
    await run('content_blocks_updated_at_idx', `CREATE INDEX IF NOT EXISTS "content_blocks_updated_at_idx" ON "content_blocks" ("updated_at")`)
    await run('content_blocks_created_at_idx', `CREATE INDEX IF NOT EXISTS "content_blocks_created_at_idx" ON "content_blocks" ("created_at")`)

    // content_blocks_items — array field "items"
    await run('content_blocks_items', `CREATE TABLE IF NOT EXISTS "content_blocks_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "content_blocks"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "title" varchar,
      "subtitle" varchar,
      "body" text,
      "image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "price" varchar,
      "url" varchar
    )`)
    await run('content_blocks_items_parent_idx', `CREATE INDEX IF NOT EXISTS "content_blocks_items_parent_idx" ON "content_blocks_items" ("_parent_id")`)

    // content_blocks_rels — for any future hasMany relationships
    await run('content_blocks_rels', `CREATE TABLE IF NOT EXISTS "content_blocks_rels" (
      "id" serial PRIMARY KEY,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "content_blocks"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "media_id" integer REFERENCES "media"("id") ON DELETE CASCADE
    )`)

    // ── 4. AI_PROFILE GLOBAL ────────────────────────────────────────────────
    await run('ai_profile', `CREATE TABLE IF NOT EXISTS "ai_profile" (
      "id" serial PRIMARY KEY,
      "brand_voice" text,
      "target_audience" text,
      "preferred_cta" varchar,
      "warranty_rules" text,
      "pricing_rules" text,
      "image_generation_style" text,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`)

    // ai_profile_tone — hasMany select; same fix as services_audience.
    await run('drop_ai_profile_tone_bad', `DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_profile_tone' AND column_name='id' AND data_type='character varying')
      THEN DROP TABLE "ai_profile_tone" CASCADE;
      END IF;
    END $$`)
    await run('ai_profile_tone', `CREATE TABLE IF NOT EXISTS "ai_profile_tone" (
      "id" serial PRIMARY KEY,
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL REFERENCES "ai_profile"("id") ON DELETE CASCADE,
      "value" varchar
    )`)

    // ai_profile_do_not_say — array
    await run('ai_profile_do_not_say', `CREATE TABLE IF NOT EXISTS "ai_profile_do_not_say" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "ai_profile"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "phrase" varchar
    )`)

    // ai_profile_approved_phrases — array
    await run('ai_profile_approved_phrases', `CREATE TABLE IF NOT EXISTS "ai_profile_approved_phrases" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "ai_profile"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "phrase" varchar
    )`)

    // ai_profile_rejected_phrases — array (find + replace_with)
    await run('ai_profile_rejected_phrases', `CREATE TABLE IF NOT EXISTS "ai_profile_rejected_phrases" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "ai_profile"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "find" varchar,
      "replace_with" varchar
    )`)

    // ai_profile_main_services — array
    await run('ai_profile_main_services', `CREATE TABLE IF NOT EXISTS "ai_profile_main_services" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "ai_profile"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "service" varchar
    )`)

    // ai_profile_target_cities — array
    await run('ai_profile_target_cities', `CREATE TABLE IF NOT EXISTS "ai_profile_target_cities" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "ai_profile"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "city" varchar
    )`)

    // ai_profile_caption_examples — array
    await run('ai_profile_caption_examples', `CREATE TABLE IF NOT EXISTS "ai_profile_caption_examples" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "ai_profile"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "caption" varchar
    )`)

    // Seed the single ai_profile row (global pattern)
    await run('ai_profile_insert', `INSERT INTO "ai_profile" ("id") VALUES (1) ON CONFLICT DO NOTHING`)

    // ── 5. ALTER EXISTING TABLES ────────────────────────────────────────────

    // ── users: add phone, avatar_id, default_organization_id, last_login ────
    await run('users_add_phone', `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar`)
    await run('users_add_avatar_id', `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_id" integer REFERENCES "media"("id") ON DELETE SET NULL`)
    await run('users_add_default_organization_id', `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "default_organization_id" integer REFERENCES "organizations"("id") ON DELETE SET NULL`)
    await run('users_add_last_login', `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login" timestamp(3) with time zone`)
    await run('users_default_org_idx', `CREATE INDEX IF NOT EXISTS "users_default_org_idx" ON "users" ("default_organization_id")`)

    // ── pages: add organization_id, page_type, status ───────────────────────
    await run('pages_add_organization_id', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "organization_id" integer REFERENCES "organizations"("id") ON DELETE SET NULL`)
    await run('pages_add_page_type', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "page_type" varchar DEFAULT 'standard'`)
    await run('pages_add_status', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'draft'`)
    // Payload versioning + drafts also tracks publish state via the underscore-prefixed _status column
    await run('pages_add__status', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "_status" varchar DEFAULT 'draft'`)
    await run('pages_org_idx', `CREATE INDEX IF NOT EXISTS "pages_org_idx" ON "pages" ("organization_id")`)

    // pages: extended hero fields (heroImage_id already handled via pages_rels; add new group cols)
    await run('pages_add_hero_image_id', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "hero_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL`)
    await run('pages_add_hero_c_t_a_label', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "hero_c_t_a_label" varchar`)
    await run('pages_add_hero_c_t_a_url', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "hero_c_t_a_url" varchar`)
    await run('pages_add_hero_secondary_c_t_a_label', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "hero_secondary_c_t_a_label" varchar`)
    await run('pages_add_hero_secondary_c_t_a_url', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "hero_secondary_c_t_a_url" varchar`)
    await run('pages_add_hero_headline', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "hero_headline" varchar`)
    await run('pages_add_hero_subtext', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "hero_subtext" text`)

    // pages: full SEO group (seo_meta_title + seo_meta_description + seo_og_image_id already exist)
    await run('pages_add_seo_h1', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_h1" varchar`)
    await run('pages_add_seo_canonical_url', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_canonical_url" varchar`)
    await run('pages_add_seo_og_title', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_og_title" varchar`)
    await run('pages_add_seo_og_description', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_og_description" text`)
    await run('pages_add_seo_schema_type', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_schema_type" varchar DEFAULT 'WebPage'`)
    await run('pages_add_seo_schema_json_ld', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_schema_json_ld" text`)
    await run('pages_add_seo_indexable', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_indexable" boolean DEFAULT true`)
    await run('pages_add_seo_include_in_sitemap', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_include_in_sitemap" boolean DEFAULT true`)
    await run('pages_add_seo_sitemap_priority', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_sitemap_priority" numeric DEFAULT 0.7`)
    await run('pages_add_seo_change_frequency', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_change_frequency" varchar DEFAULT 'weekly'`)
    await run('pages_add_seo_keywords', `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_keywords" varchar`)

    // pages_sections: add block_ref_id + rich_content for new section types
    await run('pages_sections_add_block_ref_id', `ALTER TABLE "pages_sections" ADD COLUMN IF NOT EXISTS "block_ref_id" integer REFERENCES "content_blocks"("id") ON DELETE SET NULL`)
    await run('pages_sections_add_rich_content', `ALTER TABLE "pages_sections" ADD COLUMN IF NOT EXISTS "rich_content" jsonb`)

    // pages_faq_items — new array (page-level FAQ)
    await run('pages_faq_items', `CREATE TABLE IF NOT EXISTS "pages_faq_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "question" varchar,
      "answer" text
    )`)
    await run('pages_faq_items_parent_idx', `CREATE INDEX IF NOT EXISTS "pages_faq_items_parent_idx" ON "pages_faq_items" ("_parent_id")`)

    // pages_internal_links — new array
    await run('pages_internal_links', `CREATE TABLE IF NOT EXISTS "pages_internal_links" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "label" varchar,
      "url" varchar
    )`)
    await run('pages_internal_links_parent_idx', `CREATE INDEX IF NOT EXISTS "pages_internal_links_parent_idx" ON "pages_internal_links" ("_parent_id")`)

    // ── services: add organization_id, warranty_notes, short_description, cta, new SEO cols ──
    await run('services_add_organization_id', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "organization_id" integer REFERENCES "organizations"("id") ON DELETE SET NULL`)
    await run('services_add_short_description', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "short_description" text`)
    await run('services_add_warranty_notes', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "warranty_notes" text`)
    await run('services_add_cta_label', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "cta_label" varchar DEFAULT 'Get a Quote'`)
    await run('services_add_cta_url', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "cta_url" varchar DEFAULT '/quote.html'`)
    await run('services_org_idx', `CREATE INDEX IF NOT EXISTS "services_org_idx" ON "services" ("organization_id")`)

    // services: full SEO group (seo_meta_title + seo_meta_description + seo_keywords already exist)
    await run('services_add_seo_h1', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_h1" varchar`)
    await run('services_add_seo_canonical_url', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_canonical_url" varchar`)
    await run('services_add_seo_og_title', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_og_title" varchar`)
    await run('services_add_seo_og_description', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_og_description" text`)
    await run('services_add_seo_og_image_id', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_og_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL`)
    await run('services_add_seo_schema_type', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_schema_type" varchar DEFAULT 'Service'`)
    await run('services_add_seo_schema_json_ld', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_schema_json_ld" text`)
    await run('services_add_seo_indexable', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_indexable" boolean DEFAULT true`)
    await run('services_add_seo_include_in_sitemap', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_include_in_sitemap" boolean DEFAULT true`)
    await run('services_add_seo_sitemap_priority', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_sitemap_priority" numeric DEFAULT 0.7`)
    await run('services_add_seo_change_frequency', `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_change_frequency" varchar DEFAULT 'weekly'`)

    // services_target_customers — new array
    await run('services_target_customers', `CREATE TABLE IF NOT EXISTS "services_target_customers" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "profile" varchar
    )`)
    await run('services_target_customers_parent_idx', `CREATE INDEX IF NOT EXISTS "services_target_customers_parent_idx" ON "services_target_customers" ("_parent_id")`)

    // services_popular_add_ons — new array
    await run('services_popular_add_ons', `CREATE TABLE IF NOT EXISTS "services_popular_add_ons" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "name" varchar,
      "price" varchar,
      "description" varchar
    )`)
    await run('services_popular_add_ons_parent_idx', `CREATE INDEX IF NOT EXISTS "services_popular_add_ons_parent_idx" ON "services_popular_add_ons" ("_parent_id")`)

    // services_rels: add services_id column for relatedServices (hasMany self-relation)
    await run('services_rels_add_services_id', `ALTER TABLE "services_rels" ADD COLUMN IF NOT EXISTS "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE`)

    // ── geo_pages: add organization_id, county, new SEO cols ────────────────
    await run('geo_pages_add_organization_id', `ALTER TABLE "geo_pages" ADD COLUMN IF NOT EXISTS "organization_id" integer REFERENCES "organizations"("id") ON DELETE SET NULL`)
    await run('geo_pages_add_county', `ALTER TABLE "geo_pages" ADD COLUMN IF NOT EXISTS "county" varchar`)
    await run('geo_pages_org_idx', `CREATE INDEX IF NOT EXISTS "geo_pages_org_idx" ON "geo_pages" ("organization_id")`)

    // geo_pages: full SEO group (seo_meta_title + seo_meta_description + seo_h1 + seo_keywords already exist)
    await run('geo_pages_add_seo_canonical_url', `ALTER TABLE "geo_pages" ADD COLUMN IF NOT EXISTS "seo_canonical_url" varchar`)
    await run('geo_pages_add_seo_og_title', `ALTER TABLE "geo_pages" ADD COLUMN IF NOT EXISTS "seo_og_title" varchar`)
    await run('geo_pages_add_seo_og_description', `ALTER TABLE "geo_pages" ADD COLUMN IF NOT EXISTS "seo_og_description" text`)
    await run('geo_pages_add_seo_og_image_id', `ALTER TABLE "geo_pages" ADD COLUMN IF NOT EXISTS "seo_og_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL`)
    await run('geo_pages_add_seo_schema_type', `ALTER TABLE "geo_pages" ADD COLUMN IF NOT EXISTS "seo_schema_type" varchar DEFAULT 'LocalBusiness'`)
    await run('geo_pages_add_seo_schema_json_ld', `ALTER TABLE "geo_pages" ADD COLUMN IF NOT EXISTS "seo_schema_json_ld" text`)
    await run('geo_pages_add_seo_indexable', `ALTER TABLE "geo_pages" ADD COLUMN IF NOT EXISTS "seo_indexable" boolean DEFAULT true`)
    await run('geo_pages_add_seo_include_in_sitemap', `ALTER TABLE "geo_pages" ADD COLUMN IF NOT EXISTS "seo_include_in_sitemap" boolean DEFAULT true`)
    await run('geo_pages_add_seo_sitemap_priority', `ALTER TABLE "geo_pages" ADD COLUMN IF NOT EXISTS "seo_sitemap_priority" numeric DEFAULT 0.7`)
    await run('geo_pages_add_seo_change_frequency', `ALTER TABLE "geo_pages" ADD COLUMN IF NOT EXISTS "seo_change_frequency" varchar DEFAULT 'weekly'`)

    // geo_pages_rels: add media_id for localProof image uploads
    await run('geo_pages_rels_add_media_id', `ALTER TABLE "geo_pages_rels" ADD COLUMN IF NOT EXISTS "media_id" integer REFERENCES "media"("id") ON DELETE CASCADE`)

    // geo_pages_local_proof — new array
    await run('geo_pages_local_proof', `CREATE TABLE IF NOT EXISTS "geo_pages_local_proof" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "geo_pages"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "headline" varchar,
      "detail" text,
      "image_id" integer REFERENCES "media"("id") ON DELETE SET NULL
    )`)
    await run('geo_pages_local_proof_parent_idx', `CREATE INDEX IF NOT EXISTS "geo_pages_local_proof_parent_idx" ON "geo_pages_local_proof" ("_parent_id")`)

    // geo_pages_faq_items — new array
    await run('geo_pages_faq_items', `CREATE TABLE IF NOT EXISTS "geo_pages_faq_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "geo_pages"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "question" varchar,
      "answer" text
    )`)
    await run('geo_pages_faq_items_parent_idx', `CREATE INDEX IF NOT EXISTS "geo_pages_faq_items_parent_idx" ON "geo_pages_faq_items" ("_parent_id")`)

    // geo_pages_internal_links — new array
    await run('geo_pages_internal_links', `CREATE TABLE IF NOT EXISTS "geo_pages_internal_links" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "geo_pages"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "label" varchar,
      "url" varchar
    )`)
    await run('geo_pages_internal_links_parent_idx', `CREATE INDEX IF NOT EXISTS "geo_pages_internal_links_parent_idx" ON "geo_pages_internal_links" ("_parent_id")`)

    // ── media: add organization_id, location_id, before_after, AI fields ────
    await run('media_add_organization_id', `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "organization_id" integer REFERENCES "organizations"("id") ON DELETE SET NULL`)
    await run('media_add_location_id', `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "location_id" integer REFERENCES "geo_pages"("id") ON DELETE SET NULL`)
    await run('media_add_before_after', `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "before_after" varchar DEFAULT 'na'`)
    await run('media_add_title', `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "title" varchar`)
    await run('media_add_ai_description', `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "ai_description" text`)
    await run('media_add_ai_suggested_alt', `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "ai_suggested_alt" varchar`)
    await run('media_add_ai_analyzed_at', `ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "ai_analyzed_at" timestamp(3) with time zone`)
    await run('media_org_idx', `CREATE INDEX IF NOT EXISTS "media_org_idx" ON "media" ("organization_id")`)

    // media_ai_detected_objects — new array
    await run('media_ai_detected_objects', `CREATE TABLE IF NOT EXISTS "media_ai_detected_objects" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "media"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "object" varchar
    )`)
    await run('media_ai_detected_objects_parent_idx', `CREATE INDEX IF NOT EXISTS "media_ai_detected_objects_parent_idx" ON "media_ai_detected_objects" ("_parent_id")`)

    // ── leads: add organization_id, priority, assigned_to_id ────────────────
    // Note: status + assigned_to columns already exist (named differently); add new portal ones
    await run('leads_add_organization_id', `ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "organization_id" integer REFERENCES "organizations"("id") ON DELETE SET NULL`)
    await run('leads_add_priority', `ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "priority" varchar DEFAULT 'normal'`)
    await run('leads_add_assigned_to_id', `ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "assigned_to_id" integer REFERENCES "users"("id") ON DELETE SET NULL`)
    await run('leads_org_idx', `CREATE INDEX IF NOT EXISTS "leads_org_idx" ON "leads" ("organization_id")`)

    // leads_notes — new array (staff-only timeline)
    await run('leads_notes', `CREATE TABLE IF NOT EXISTS "leads_notes" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY,
      "note" text,
      "author_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
      "created_at" timestamp(3) with time zone
    )`)
    await run('leads_notes_parent_idx', `CREATE INDEX IF NOT EXISTS "leads_notes_parent_idx" ON "leads_notes" ("_parent_id")`)

    // ── testimonials: add organization_id ───────────────────────────────────
    await run('testimonials_add_organization_id', `ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "organization_id" integer REFERENCES "organizations"("id") ON DELETE SET NULL`)
    await run('testimonials_org_idx', `CREATE INDEX IF NOT EXISTS "testimonials_org_idx" ON "testimonials" ("organization_id")`)

    // ── faqs: add organization_id ────────────────────────────────────────────
    await run('faqs_add_organization_id', `ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "organization_id" integer REFERENCES "organizations"("id") ON DELETE SET NULL`)
    await run('faqs_org_idx', `CREATE INDEX IF NOT EXISTS "faqs_org_idx" ON "faqs" ("organization_id")`)

    // ── quotes: add organization_id ──────────────────────────────────────────
    await run('quotes_add_organization_id', `ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "organization_id" integer REFERENCES "organizations"("id") ON DELETE SET NULL`)
    await run('quotes_org_idx', `CREATE INDEX IF NOT EXISTS "quotes_org_idx" ON "quotes" ("organization_id")`)

    // ── 6. PAYLOAD_LOCKED_DOCUMENTS_RELS: add new collection FK columns ──────
    await run('pld_rels_add_organizations_id', `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "organizations_id" integer REFERENCES "organizations"("id") ON DELETE CASCADE`)
    await run('pld_rels_add_org_memberships_id', `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "org_memberships_id" integer REFERENCES "org_memberships"("id") ON DELETE CASCADE`)
    await run('pld_rels_add_content_blocks_id', `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "content_blocks_id" integer REFERENCES "content_blocks"("id") ON DELETE CASCADE`)

    results.push('Upfit Portal multi-tenant schema migration complete')

    // Verify all collections work
    for (const slug of ['users', 'services', 'leads', 'account-requests', 'media', 'pages', 'geo-pages', 'testimonials', 'faqs', 'tags', 'quotes', 'organizations', 'org-memberships', 'content-blocks']) {
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

    // Test ai-profile global
    try {
      await payload.findGlobal({ slug: 'ai-profile', overrideAccess: true })
      results.push('✅ ai-profile global: OK')
    } catch (e: unknown) {
      const cause = (e as any)?.cause?.message || (e instanceof Error ? e.message : String(e))
      results.push(`❌ ai-profile global: ${String(cause).substring(0, 150)}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    results.push('FATAL: ' + msg.substring(0, 400))
    return NextResponse.json({ success: false, results, error: msg }, { status: 500 })
  }
}
