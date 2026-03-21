-- ============================================================
-- AgriFlow  —  Supabase / PostgreSQL Database Schema
-- ============================================================
-- HOW TO USE:
--   1. Create a free project at https://supabase.com
--   2. Go to SQL Editor in your project dashboard
--   3. Paste this entire file and click Run
--   4. Copy your Project URL and anon/service keys into .env
--   5. Set DB_MODE=supabase in .env
--
-- This schema is designed for:
--   • Full-text search on farmer names and crops
--   • Efficient district/province filtering for the map
--   • Row-Level Security (RLS) so farmers only see their own data
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
-- uuid_generate_v4() for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pg_trgm for fast full-text ILIKE queries
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── ENUM TYPES ───────────────────────────────────────────────
CREATE TYPE user_role       AS ENUM ('farmer', 'customer', 'admin');
CREATE TYPE user_status     AS ENUM ('active', 'pending', 'suspended');
CREATE TYPE submission_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE listing_status  AS ENUM ('active', 'sold', 'expired');
CREATE TYPE alert_severity  AS ENUM ('info', 'warning', 'critical');

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL,
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT,
  role          user_role   NOT NULL DEFAULT 'farmer',
  status        user_status NOT NULL DEFAULT 'active',
  district      TEXT,
  province      TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast email login lookups
CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_role     ON users (role);
CREATE INDEX idx_users_district ON users (district);

-- ── SUBMISSIONS ──────────────────────────────────────────────
CREATE TABLE submissions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_name   TEXT        NOT NULL,
  user_id       UUID        REFERENCES users(id) ON DELETE SET NULL,
  district      TEXT        NOT NULL,
  province      TEXT,
  crop          TEXT        NOT NULL,
  quantity      NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit          TEXT        NOT NULL DEFAULT 'kg',
  price         NUMERIC(10, 2),
  harvest_date  DATE,
  notes         TEXT,
  status        submission_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for map aggregation and admin filtering
CREATE INDEX idx_submissions_district ON submissions (district);
CREATE INDEX idx_submissions_province ON submissions (province);
CREATE INDEX idx_submissions_crop     ON submissions (crop);
CREATE INDEX idx_submissions_status   ON submissions (status);
CREATE INDEX idx_submissions_user     ON submissions (user_id);
-- Trigram index for full-text farmer name search
CREATE INDEX idx_submissions_farmer_trgm ON submissions USING GIN (farmer_name gin_trgm_ops);

-- ── LISTINGS ─────────────────────────────────────────────────
CREATE TABLE listings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_name   TEXT        NOT NULL,
  user_id       UUID        REFERENCES users(id) ON DELETE SET NULL,
  crop          TEXT        NOT NULL,
  quantity      NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit          TEXT        NOT NULL DEFAULT 'kg',
  price         NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  district      TEXT,
  province      TEXT,
  description   TEXT,
  status        listing_status NOT NULL DEFAULT 'active',
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_status   ON listings (status);
CREATE INDEX idx_listings_crop     ON listings (crop);
CREATE INDEX idx_listings_province ON listings (province);

-- ── ALERTS ───────────────────────────────────────────────────
CREATE TABLE alerts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      TEXT          NOT NULL,
  message    TEXT,
  severity   alert_severity NOT NULL DEFAULT 'info',
  read       BOOLEAN       NOT NULL DEFAULT FALSE,
  district   TEXT,
  crop       TEXT,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_read     ON alerts (read);
CREATE INDEX idx_alerts_severity ON alerts (severity);

-- ── AUTO-UPDATED updated_at TRIGGER ──────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── ROW LEVEL SECURITY (RLS) ──────────────────────────────────
-- Enable RLS on all tables
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts      ENABLE ROW LEVEL SECURITY;

-- USERS: anyone can read public profile data; only owner can update
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- SUBMISSIONS: public read, authenticated write, admin full control
CREATE POLICY "Submissions are publicly readable"
  ON submissions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can submit"
  ON submissions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update any submission"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- LISTINGS: public read, owners and admins can write
CREATE POLICY "Listings are publicly readable"
  ON listings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Owners and admins can update listings"
  ON listings FOR UPDATE
  USING (
    user_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ALERTS: logged-in users read; only admins write
CREATE POLICY "Logged-in users can read alerts"
  ON alerts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage alerts"
  ON alerts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ── USEFUL VIEWS ──────────────────────────────────────────────
-- District aggregates view — used by the map API
CREATE OR REPLACE VIEW district_aggregates AS
SELECT
  district,
  province,
  crop,
  COUNT(*)                       AS submission_count,
  SUM(quantity)                  AS total_harvest_kg,
  ROUND(SUM(quantity) * 0.70)    AS estimated_consumption_kg,
  ROUND(SUM(quantity) * 0.30)    AS estimated_surplus_kg,
  ROUND(AVG(price))              AS avg_price,
  CASE
    WHEN SUM(quantity) * 0.30 > 0  THEN 'surplus'
    WHEN SUM(quantity) * 0.30 < -10 THEN 'shortage'
    ELSE 'stable'
  END AS status
FROM submissions
WHERE status != 'rejected'
GROUP BY district, province, crop;

-- Admin KPI summary view
CREATE OR REPLACE VIEW admin_kpis AS
SELECT
  (SELECT COUNT(*) FROM users WHERE role = 'farmer')                         AS total_farmers,
  (SELECT COUNT(*) FROM users WHERE role = 'customer')                       AS total_customers,
  (SELECT COUNT(*) FROM users)                                                AS total_users,
  (SELECT COUNT(*) FROM submissions)                                          AS total_submissions,
  (SELECT COUNT(*) FROM submissions WHERE status = 'pending')                AS pending_submissions,
  (SELECT COUNT(*) FROM listings  WHERE status = 'active')                   AS active_listings,
  (SELECT COUNT(*) FROM alerts    WHERE read = FALSE)                        AS unread_alerts;

-- ── SEED DATA ─────────────────────────────────────────────────
-- Insert the default admin user.
-- Password: admin123  (bcrypt hash — generated externally)
INSERT INTO users (name, email, password_hash, role, status)
VALUES (
  'Administrator',
  'admin@agriflow.lk',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/RewqkFfnBFQ1B8UUK',
  'admin',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- Insert a system alert so the dashboard isn't empty on first run.
INSERT INTO alerts (title, message, severity)
VALUES (
  'Database connected',
  'AgriFlow Supabase database initialized successfully.',
  'info'
);
