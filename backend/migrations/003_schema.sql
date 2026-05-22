-- AIVCDealFlowCopilot v3 schema additions (Apply pass 7 — full backlog)
-- Backlog items 6, 7, 8 from _AUDIT_NOTE.md:
--   - cap_tables CRUD (entries, classes, SAFEs)
--   - lp_comms_templates CRUD
--   - KPI ingest pipeline schema (sources + records)
-- Also adds ai_results audit table if not already present.

-- ─────────────────────────────────────────────
-- AI results history (used by /api/ai/history)
-- Created defensively in case the prior bootstrap step was skipped.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_results (
  id              SERIAL PRIMARY KEY,
  feature         VARCHAR(80),
  input           JSONB,
  output          JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_results_feature_created
  ON ai_results (feature, created_at DESC);

-- ─────────────────────────────────────────────
-- Cap table entries
-- One row per stakeholder line item (founder, employee pool, investor, SAFE,
-- convertible note, warrant). `class` distinguishes share class (common,
-- preferred_series_a, etc.) or convertible-instrument type.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cap_tables (
  id                 SERIAL PRIMARY KEY,
  entry_id           VARCHAR(50) UNIQUE,
  company_id         VARCHAR(50),
  stakeholder        VARCHAR(200),
  class              VARCHAR(60),               -- common|preferred_seed|preferred_a|safe|note|option_pool|warrant
  shares             BIGINT DEFAULT 0,
  pct_ownership      NUMERIC(8,4) DEFAULT 0,    -- 0..100
  invested_usd       BIGINT DEFAULT 0,
  valuation_cap_usd  BIGINT DEFAULT 0,          -- SAFE/note cap, 0 if N/A
  discount_pct       NUMERIC(6,2) DEFAULT 0,    -- SAFE/note discount
  issued_at          DATE,
  notes              TEXT,
  status             VARCHAR(30) DEFAULT 'active',
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cap_tables_company
  ON cap_tables (company_id);

-- ─────────────────────────────────────────────
-- LP comms templates
-- Reusable templates for LP correspondence (quarterly letter, capital-call
-- notice, distribution notice, annual meeting agenda). `body` supports
-- {{handlebars-style}} variable substitution; the frontend / a future
-- send-pipeline expands them against fund + period context.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lp_comms_templates (
  id              SERIAL PRIMARY KEY,
  template_id     VARCHAR(50) UNIQUE,
  name            VARCHAR(200),
  category        VARCHAR(60),                -- quarterly|capital_call|distribution|annual|adhoc
  subject         VARCHAR(300),
  body            TEXT,                       -- supports {{variables}}
  variables       TEXT,                       -- comma-separated declared variable names
  fund_id         VARCHAR(50),                -- optional scoping to a fund
  status          VARCHAR(30) DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lp_comms_templates_category
  ON lp_comms_templates (category);

-- ─────────────────────────────────────────────
-- KPI ingest — sources
-- Each row = a registered KPI ingest channel for a portfolio company.
-- `kind` declares the channel; `config` is JSONB for channel-specific
-- settings (file path glob, IMAP folder, webhook URL, etc.).
-- `schedule_cron` is a stub for a future scheduler; today it is purely
-- documentary metadata.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kpi_ingest_sources (
  id              SERIAL PRIMARY KEY,
  source_id       VARCHAR(50) UNIQUE,
  company_id      VARCHAR(50),
  name            VARCHAR(200),
  kind            VARCHAR(30),                -- csv_upload|email|webhook|gsheet|manual
  config          TEXT,                       -- JSON blob (channel-specific)
  schedule_cron   VARCHAR(60),
  alert_threshold TEXT,                       -- JSON blob of KPI → bound
  status          VARCHAR(30) DEFAULT 'active',
  last_run_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kpi_ingest_sources_company
  ON kpi_ingest_sources (company_id);

-- ─────────────────────────────────────────────
-- KPI ingest — records
-- Each row = a single ingested KPI observation. The companion endpoint
-- `POST /api/kpi-ingest-records/bulk` accepts a CSV (handled by the standard
-- crud /bulk-import route) so quarterly KPI uploads can be one-shot.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kpi_ingest_records (
  id              SERIAL PRIMARY KEY,
  record_id       VARCHAR(50) UNIQUE,
  source_id       VARCHAR(50),
  company_id      VARCHAR(50),
  kpi             VARCHAR(80),                -- arr_usd|burn_usd|runway_months|nps|gm_pct|ndr_pct|...
  value           NUMERIC(20,4) DEFAULT 0,
  unit            VARCHAR(20),                -- usd|pct|months|count
  period          VARCHAR(20),                -- 2026Q1|2026-04|etc
  observed_at     DATE,
  raw             TEXT,                       -- raw email/csv line for audit
  alert_state     VARCHAR(20) DEFAULT 'ok',   -- ok|warning|critical
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kpi_ingest_records_company_period
  ON kpi_ingest_records (company_id, period);
CREATE INDEX IF NOT EXISTS idx_kpi_ingest_records_kpi
  ON kpi_ingest_records (kpi);
