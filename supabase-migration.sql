-- Capital Upfitters CMS — Supabase Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wxbgbzeobltckzlbftmq/sql
-- This creates all tables Payload CMS needs

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar,
  role varchar DEFAULT 'editor',
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  email varchar NOT NULL UNIQUE,
  reset_password_token varchar,
  reset_password_expiration timestamp with time zone,
  salt varchar,
  hash varchar,
  login_attempts numeric DEFAULT 0,
  lock_until timestamp with time zone
);

CREATE TABLE IF NOT EXISTS users_sessions (
  _order integer NOT NULL,
  _parent_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  created_at timestamp with time zone,
  expires_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS users_sessions_parent_id ON users_sessions (_parent_id);

-- ─── PAYLOAD SYSTEM TABLES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payload_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar,
  value jsonb,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS payload_preferences_rels (
  id serial PRIMARY KEY,
  "order" integer,
  parent_id uuid NOT NULL REFERENCES payload_preferences(id) ON DELETE CASCADE,
  path varchar NOT NULL,
  users_id uuid REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payload_migrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar,
  batch numeric,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS payload_locked_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  global_slug varchar,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS payload_locked_documents_rels (
  id serial PRIMARY KEY,
  "order" integer,
  parent_id uuid NOT NULL REFERENCES payload_locked_documents(id) ON DELETE CASCADE,
  path varchar NOT NULL,
  users_id uuid REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payload_kv (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" varchar NOT NULL UNIQUE,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ─── SERVICES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  slug varchar UNIQUE,
  category varchar,
  price_from numeric,
  price_to numeric,
  price_label varchar,
  tagline varchar,
  description jsonb,
  turnaround varchar,
  warranty varchar,
  hero_image_id uuid,
  active boolean DEFAULT true,
  sort_order numeric DEFAULT 99,
  seo_meta_title varchar,
  seo_meta_description varchar,
  seo_keywords varchar,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS services_audience (
  _order integer NOT NULL,
  _parent_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  value varchar
);

CREATE TABLE IF NOT EXISTS services_features (
  _order integer NOT NULL,
  _parent_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  feature varchar
);

CREATE TABLE IF NOT EXISTS services_faq_items (
  _order integer NOT NULL,
  _parent_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  question varchar,
  answer text
);

CREATE TABLE IF NOT EXISTS services_gallery_images (
  _order integer NOT NULL,
  _parent_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  caption varchar
);

CREATE TABLE IF NOT EXISTS services_rels (
  id serial PRIMARY KEY,
  "order" integer,
  parent_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  path varchar NOT NULL,
  media_id uuid
);

-- ─── MEDIA ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alt varchar NOT NULL,
  category varchar,
  vehicle_type varchar,
  caption varchar,
  featured boolean DEFAULT false,
  show_in_gallery boolean DEFAULT true,
  url varchar,
  thumbnail_url varchar,
  card_url varchar,
  hero_url varchar,
  filename varchar,
  mime_type varchar,
  filesize numeric,
  width numeric,
  height numeric,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ─── PAGES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar NOT NULL,
  slug varchar UNIQUE,
  hero_headline varchar,
  hero_subtext text,
  hero_cta_label varchar,
  hero_cta_url varchar,
  seo_meta_title varchar,
  seo_meta_description varchar,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS pages_sections (
  _order integer NOT NULL,
  _parent_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  section_type varchar,
  headline varchar,
  subtext text,
  custom_html text
);

-- ─── GEO PAGES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS geo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city varchar NOT NULL,
  state varchar DEFAULT 'MD',
  slug varchar UNIQUE,
  hero_headline varchar,
  local_intro text,
  lat numeric,
  lng numeric,
  active boolean DEFAULT true,
  seo_meta_title varchar,
  seo_meta_description varchar,
  seo_h1 varchar,
  seo_keywords varchar,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS geo_pages_nearby_areas (
  _order integer NOT NULL,
  _parent_id uuid NOT NULL REFERENCES geo_pages(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  area varchar
);

CREATE TABLE IF NOT EXISTS geo_pages_rels (
  id serial PRIMARY KEY,
  "order" integer,
  parent_id uuid NOT NULL REFERENCES geo_pages(id) ON DELETE CASCADE,
  path varchar NOT NULL,
  services_id uuid REFERENCES services(id) ON DELETE CASCADE
);

-- ─── TESTIMONIALS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name varchar NOT NULL,
  customer_title varchar,
  quote text NOT NULL,
  rating varchar DEFAULT '5',
  audience varchar,
  source varchar,
  source_url varchar,
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS testimonials_rels (
  id serial PRIMARY KEY,
  "order" integer,
  parent_id uuid NOT NULL REFERENCES testimonials(id) ON DELETE CASCADE,
  path varchar NOT NULL,
  services_id uuid REFERENCES services(id) ON DELETE CASCADE
);

-- ─── FAQS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question varchar NOT NULL,
  answer jsonb NOT NULL,
  sort_order numeric DEFAULT 99,
  active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS faqs_audience (
  _order integer NOT NULL,
  _parent_id uuid NOT NULL REFERENCES faqs(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  value varchar
);

CREATE TABLE IF NOT EXISTS faqs_rels (
  id serial PRIMARY KEY,
  "order" integer,
  parent_id uuid NOT NULL REFERENCES faqs(id) ON DELETE CASCADE,
  path varchar NOT NULL,
  services_id uuid REFERENCES services(id) ON DELETE CASCADE
);

-- ─── TAGS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL UNIQUE,
  type varchar,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ─── LEADS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id varchar,
  lead_type varchar NOT NULL,
  status varchar DEFAULT 'new',
  name varchar NOT NULL,
  phone varchar,
  email varchar,
  company varchar,
  service varchar,
  vehicle_year varchar,
  vehicle_make varchar,
  message text,
  fleet_size numeric,
  source varchar,
  internal_notes text,
  assigned_to varchar,
  follow_up_date timestamp with time zone,
  ai_price_estimate varchar,
  ai_timeline_estimate varchar,
  ai_personalized_message text,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ─── QUOTES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id varchar,
  status varchar DEFAULT 'draft',
  subtotal numeric,
  discount numeric,
  total_estimate numeric,
  valid_until timestamp with time zone,
  notes text,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS quotes_line_items (
  _order integer NOT NULL,
  _parent_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  description varchar,
  price numeric
);

CREATE TABLE IF NOT EXISTS quotes_rels (
  id serial PRIMARY KEY,
  "order" integer,
  parent_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  path varchar NOT NULL,
  leads_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  services_id uuid REFERENCES services(id) ON DELETE CASCADE
);

-- ─── GLOBALS: SETTINGS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name varchar DEFAULT 'Capital Upfitters',
  contact_phone varchar,
  contact_email varchar,
  contact_address varchar,
  contact_full_address text,
  hours_weekdays varchar,
  hours_saturday varchar,
  hours_sunday varchar,
  social_facebook varchar,
  social_instagram varchar,
  social_youtube varchar,
  social_google varchar,
  seo_default_title varchar,
  seo_default_description text,
  urgency_enabled boolean DEFAULT true,
  urgency_message_1 varchar DEFAULT 'Same-week appointments available — call now',
  urgency_message_2 varchar DEFAULT 'Fleet pricing available — no minimums',
  portal_url varchar DEFAULT 'https://upfit-portal-58190af9.base44.app',
  portal_register_url varchar,
  portal_login_url varchar,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS settings_stats_items (
  _order integer NOT NULL,
  _parent_id uuid NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  value varchar,
  label varchar
);

-- Insert default settings row
INSERT INTO settings (id) 
SELECT gen_random_uuid() 
WHERE NOT EXISTS (SELECT 1 FROM settings);

-- ─── MARK MIGRATION AS RUN ───────────────────────────────────────────────────
INSERT INTO payload_migrations (id, name, batch, updated_at, created_at)
VALUES (gen_random_uuid(), '20260324_initial', 1, now(), now())
ON CONFLICT DO NOTHING;

-- Verify
SELECT 'Tables created: ' || count(*)::text as result 
FROM pg_tables 
WHERE schemaname = 'public';
