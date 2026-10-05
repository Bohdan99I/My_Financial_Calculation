/*
# Create operations and app_settings tables (single-tenant, no auth)

1. New Tables
- `operations`: stores each income/expense entry
  - id (uuid, primary key)
  - date (date, not null) — the date the income/expense occurred
  - type (text, not null) — 'income' or 'expense'
  - amount (numeric(12,2), not null) — the monetary amount
  - category (text, not null) — source for income, category for expense
  - comment (text, nullable) — optional user note
  - created_at (timestamptz, default now())
- `app_settings`: single-row settings table for the app
  - id (int, primary key, always 1)
  - initial_balance (numeric(12,2), default 0) — starting balance before first operation
  - use_initial_balance (boolean, default false) — whether to include initial balance in total
  - updated_at (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated full CRUD because this is a single-tenant personal app with no sign-in.

3. Notes
- No user_id columns — this is a personal tracker with no authentication.
- Index on date for fast period filtering.
*/

CREATE TABLE IF NOT EXISTS operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  category text NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operations_date ON operations(date);

ALTER TABLE operations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_operations" ON operations;
CREATE POLICY "anon_select_operations" ON operations FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_operations" ON operations;
CREATE POLICY "anon_insert_operations" ON operations FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_operations" ON operations;
CREATE POLICY "anon_update_operations" ON operations FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_operations" ON operations;
CREATE POLICY "anon_delete_operations" ON operations FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS app_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  initial_balance numeric(12,2) NOT NULL DEFAULT 0,
  use_initial_balance boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_app_settings" ON app_settings;
CREATE POLICY "anon_select_app_settings" ON app_settings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_app_settings" ON app_settings;
CREATE POLICY "anon_insert_app_settings" ON app_settings FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_app_settings" ON app_settings;
CREATE POLICY "anon_update_app_settings" ON app_settings FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_app_settings" ON app_settings;
CREATE POLICY "anon_delete_app_settings" ON app_settings FOR DELETE
TO anon, authenticated USING (true);

INSERT INTO app_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
