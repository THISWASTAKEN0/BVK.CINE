-- ============================================================
-- Photography Portfolio — Visitor Analytics
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- One row per public page view. visitor_id comes from a first-party
-- cookie so we can distinguish unique visitors from raw views.
CREATE TABLE IF NOT EXISTS page_views (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path       text NOT NULL DEFAULT '/',
  visitor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor    ON page_views (visitor_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors may ONLY insert a view — never read the table.
CREATE POLICY "anon_insert_page_views"
  ON page_views FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated admin can read (the dashboard reads via service role,
-- but this keeps direct authenticated access working too).
CREATE POLICY "auth_read_page_views"
  ON page_views FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- Aggregated stats — distinct counting done in SQL for speed.
-- Called by the service-role client from /api/stats.
-- ============================================================

CREATE OR REPLACE FUNCTION visitor_stats()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total',  (SELECT count(*) FROM page_views),
    'unique', (SELECT count(DISTINCT visitor_id) FROM page_views),
    'today',  (SELECT count(*) FROM page_views
                 WHERE created_at >= date_trunc('day', now())),
    'last7',  (SELECT count(*) FROM page_views
                 WHERE created_at >= date_trunc('day', now()) - interval '6 days'),
    'daily',  (SELECT coalesce(json_agg(row_to_json(d)), '[]'::json) FROM (
                 SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
                        count(*)::int AS views
                 FROM page_views
                 WHERE created_at >= date_trunc('day', now()) - interval '6 days'
                 GROUP BY 1
                 ORDER BY 1
               ) d)
  );
$$;

-- ============================================================
-- Done. Paste this entire file into the Supabase SQL Editor
-- and click Run.
-- ============================================================
