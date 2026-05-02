-- ============================================================
-- Packworkz SQL Migration — Run once in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/tmvbjbmudxyvimdnhrmw/sql/new
-- ============================================================

-- 1. Add admin columns to quote_requests
ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS admin_notes     TEXT,
  ADD COLUMN IF NOT EXISTS payment_link    TEXT,
  ADD COLUMN IF NOT EXISTS quoted_amount   NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS delivery_date   TEXT,
  ADD COLUMN IF NOT EXISTS payment_terms   TEXT,
  ADD COLUMN IF NOT EXISTS artwork_option  TEXT,
  ADD COLUMN IF NOT EXISTS sample_option   TEXT;

-- 2. Add payment_link to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_link TEXT;

-- 3. After running this migration:
--    - All admin quote fields (notes, payment link, amount, delivery date, payment terms) will persist properly
--    - Any data temporarily stored in rejection_reason (__ADMIN_META__ prefix) will auto-migrate on next save
-- ============================================================
