import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    const payload = await getPayload({ config })
    const db = payload.db as any
    const drizzle = db.drizzle

    results.push('Connected: ' + (process.env.DATABASE_URL || '').replace(/:([^@]+)@/, ':***@').substring(0, 60))

    // Run all CREATE TABLE statements directly — no migration files required
    const statements = [
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

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

      `CREATE TABLE IF NOT EXISTS "users_sessions" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "created_at" timestamp(3) with time zone,
        "expires_at" timestamp(3) with time zone
      )`,
      `CREATE INDEX IF NOT EXISTS "users_sessions_order_idx" ON "users_sessions" ("_order")`,
      `CREATE INDEX IF NOT EXISTS "users_sessions_parent_id_idx" ON "users_sessions" ("_parent_id")`,

      `CREATE TABLE IF NOT EXISTS "payload_preferences" (
        "id" serial PRIMARY KEY,
        "key" varchar,
        "value" jsonb,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" ("key")`,
      `CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" ("updated_at")`,

      `CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "payload_preferences"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "users_id" integer REFERENCES "users"("id") ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" ("order")`,
      `CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_id_idx" ON "payload_preferences_rels" ("parent_id")`,

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

      `CREATE TABLE IF NOT EXISTS "media" (
        "id" serial PRIMARY KEY,
        "alt" varchar,
        "caption" varchar,
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
      `CREATE INDEX IF NOT EXISTS "media_updated_at_idx" ON "media" ("updated_at")`,
      `CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" ("created_at")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" ("filename")`,

      `CREATE TABLE IF NOT EXISTS "tags" (
        "id" serial PRIMARY KEY,
        "name" varchar NOT NULL,
        "slug" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "tags_slug_idx" ON "tags" ("slug")`,

      `CREATE TABLE IF NOT EXISTS "services" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "slug" varchar,
        "short_description" varchar,
        "description" jsonb,
        "hero_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
        "price_starting_at" numeric,
        "price_unit" varchar DEFAULT 'vehicle',
        "duration_estimate" varchar,
        "is_featured" boolean DEFAULT false,
        "is_active" boolean DEFAULT true,
        "sort_order" numeric DEFAULT 0,
        "meta_title" varchar,
        "meta_description" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "services_slug_idx" ON "services" ("slug")`,

      `CREATE TABLE IF NOT EXISTS "services_features" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "text" varchar
      )`,

      `CREATE TABLE IF NOT EXISTS "services_audience" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "label" varchar
      )`,

      `CREATE TABLE IF NOT EXISTS "services_faq_items" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "question" varchar,
        "answer" varchar
      )`,

      `CREATE TABLE IF NOT EXISTS "services_gallery_images" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
        "caption" varchar
      )`,

      `CREATE TABLE IF NOT EXISTS "pages" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "slug" varchar,
        "hero_headline" varchar,
        "hero_subheadline" varchar,
        "hero_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
        "content" jsonb,
        "is_published" boolean DEFAULT true,
        "meta_title" varchar,
        "meta_description" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" ("slug")`,

      `CREATE TABLE IF NOT EXISTS "pages_sections" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "pages"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "type" varchar DEFAULT 'text',
        "heading" varchar,
        "body" varchar,
        "image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
        "cta_label" varchar,
        "cta_url" varchar
      )`,

      `CREATE TABLE IF NOT EXISTS "geo_pages" (
        "id" serial PRIMARY KEY,
        "city" varchar NOT NULL,
        "state" varchar DEFAULT 'CA',
        "slug" varchar,
        "headline" varchar,
        "subheadline" varchar,
        "body" jsonb,
        "hero_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
        "is_published" boolean DEFAULT true,
        "meta_title" varchar,
        "meta_description" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "geo_pages_slug_idx" ON "geo_pages" ("slug")`,

      `CREATE TABLE IF NOT EXISTS "geo_pages_nearby_areas" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "geo_pages"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "area_name" varchar
      )`,

      `CREATE TABLE IF NOT EXISTS "geo_pages_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "geo_pages"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS "testimonials" (
        "id" serial PRIMARY KEY,
        "author_name" varchar NOT NULL,
        "author_title" varchar,
        "author_company" varchar,
        "body" varchar NOT NULL,
        "rating" numeric DEFAULT 5,
        "is_featured" boolean DEFAULT false,
        "photo_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "testimonials_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "testimonials"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS "faqs" (
        "id" serial PRIMARY KEY,
        "question" varchar NOT NULL,
        "answer" varchar NOT NULL,
        "is_featured" boolean DEFAULT false,
        "sort_order" numeric DEFAULT 0,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "faqs_audience" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "faqs"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "label" varchar
      )`,

      `CREATE TABLE IF NOT EXISTS "faqs_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "faqs"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE,
        "tags_id" integer REFERENCES "tags"("id") ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS "leads" (
        "id" serial PRIMARY KEY,
        "name" varchar NOT NULL,
        "email" varchar NOT NULL,
        "phone" varchar,
        "company" varchar,
        "fleet_size" numeric,
        "message" varchar,
        "service_interest" varchar,
        "status" varchar DEFAULT 'new',
        "source" varchar DEFAULT 'website',
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "quotes" (
        "id" serial PRIMARY KEY,
        "quote_number" varchar,
        "status" varchar DEFAULT 'draft',
        "notes" varchar,
        "subtotal" numeric,
        "tax_rate" numeric DEFAULT 0,
        "tax_amount" numeric,
        "total" numeric,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "quotes_line_items" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "quotes"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY,
        "description" varchar,
        "price" numeric
      )`,

      `CREATE TABLE IF NOT EXISTS "quotes_rels" (
        "id" serial PRIMARY KEY,
        "order" integer,
        "parent_id" integer NOT NULL REFERENCES "quotes"("id") ON DELETE CASCADE,
        "path" varchar NOT NULL,
        "leads_id" integer REFERENCES "leads"("id") ON DELETE CASCADE,
        "services_id" integer REFERENCES "services"("id") ON DELETE CASCADE
      )`,

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

      `CREATE TABLE IF NOT EXISTS "settings" (
        "id" serial PRIMARY KEY,
        "business_name" varchar DEFAULT 'Capital Upfitters',
        "contact_phone" varchar,
        "contact_email" varchar,
        "contact_address" varchar,
        "hours_weekdays" varchar,
        "hours_saturday" varchar,
        "hours_sunday" varchar,
        "social_facebook" varchar,
        "social_instagram" varchar,
        "social_youtube" varchar,
        "seo_default_title" varchar,
        "seo_default_description" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )`,
      `INSERT INTO "settings" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING`,
    ]

    let ok = 0
    let failed = 0
    for (const sql of statements) {
      try {
        await drizzle.execute(sql)
        ok++
      } catch (e: unknown) {
        const msg = String(e).substring(0, 120)
        results.push(`⚠️ ${msg}`)
        failed++
      }
    }

    results.push(`Ran ${statements.length} statements — ${ok} OK, ${failed} skipped/errors`)

    // Verify key tables
    for (const table of ['users', 'payload_migrations', 'account_requests', 'settings']) {
      try {
        const check = await drizzle.execute(`SELECT COUNT(*) as cnt FROM "${table}"`)
        results.push(`✅ ${table}: ${check.rows?.[0]?.cnt ?? '?'} rows`)
      } catch {
        results.push(`❌ ${table}: still missing`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    results.push('FATAL: ' + message.substring(0, 500))
    return NextResponse.json({ success: false, results, error: message }, { status: 500 })
  }
}
