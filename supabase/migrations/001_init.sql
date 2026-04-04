-- ============================================================
-- Photography Portfolio — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Collections table (create first; photos FK references it)
CREATE TABLE IF NOT EXISTS collections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  description   text,
  shoot_date    date,
  cover_photo_id uuid,                         -- FK added below after photos table
  display_order integer NOT NULL DEFAULT 0,
  is_published  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id        uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  cloudinary_public_id text NOT NULL,
  cloudinary_url       text NOT NULL,
  filename             text NOT NULL,
  display_order        integer NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- Add cover_photo FK now that photos table exists
ALTER TABLE collections
  ADD CONSTRAINT fk_cover_photo
  FOREIGN KEY (cover_photo_id)
  REFERENCES photos(id)
  ON DELETE SET NULL;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_collections_display_order ON collections (display_order);
CREATE INDEX IF NOT EXISTS idx_collections_is_published ON collections (is_published);
CREATE INDEX IF NOT EXISTS idx_photos_collection_id ON photos (collection_id);
CREATE INDEX IF NOT EXISTS idx_photos_display_order ON photos (collection_id, display_order);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Public (anon): read published collections only
CREATE POLICY "anon_read_published_collections"
  ON collections FOR SELECT
  TO anon
  USING (is_published = true);

-- Public (anon): read photos that belong to a published collection
CREATE POLICY "anon_read_photos_in_published_collections"
  ON photos FOR SELECT
  TO anon
  USING (
    collection_id IN (
      SELECT id FROM collections WHERE is_published = true
    )
  );

-- Authenticated admin: full access to collections
CREATE POLICY "auth_all_collections"
  ON collections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated admin: full access to photos
CREATE POLICY "auth_all_photos"
  ON photos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Done. Paste this entire file into the Supabase SQL Editor
-- and click Run.
-- ============================================================
