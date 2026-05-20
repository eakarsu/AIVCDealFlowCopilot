-- AIVCDealFlowCopilot v2 schema additions
-- 9 remaining CRUD entities + RBAC users + notifications + attachments + webhooks + webhook_deliveries

-- ─────────────────────────────────────────────
-- RBAC
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(150) UNIQUE NOT NULL,
  password        VARCHAR(120) NOT NULL,
  name            VARCHAR(120),
  role            VARCHAR(20) DEFAULT 'viewer',  -- admin|partner|viewer
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Notifications
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER,
  title           VARCHAR(200),
  body            TEXT,
  severity        VARCHAR(20) DEFAULT 'info',
  source          VARCHAR(80),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, read_at);

-- ─────────────────────────────────────────────
-- Attachments
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attachments (
  id              SERIAL PRIMARY KEY,
  resource_type   VARCHAR(60),
  resource_id     INTEGER,
  filename        VARCHAR(255),
  original_name   VARCHAR(255),
  mimetype        VARCHAR(120),
  size_bytes      INTEGER,
  uploaded_by     VARCHAR(150),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attachments_resource
  ON attachments (resource_type, resource_id);

-- ─────────────────────────────────────────────
-- Webhooks
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhooks (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120),
  url             VARCHAR(500),
  secret          VARCHAR(120),
  events          TEXT,
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id              SERIAL PRIMARY KEY,
  webhook_id      INTEGER,
  event           VARCHAR(120),
  payload         JSONB,
  status_code     INTEGER,
  response_body   TEXT,
  attempted_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook
  ON webhook_deliveries (webhook_id, attempted_at DESC);

-- ─────────────────────────────────────────────
-- Remaining CRUD entities (9)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS board_meetings (
  id                 SERIAL PRIMARY KEY,
  meeting_id         VARCHAR(50) UNIQUE,
  company_id         VARCHAR(50),
  date               DATE,
  attendees_count    INTEGER DEFAULT 0,
  agenda             TEXT,
  notes_url          VARCHAR(500),
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS term_sheets (
  id              SERIAL PRIMARY KEY,
  ts_id           VARCHAR(50) UNIQUE,
  deal_id         VARCHAR(50),
  version         INTEGER DEFAULT 1,
  valuation_usd   BIGINT DEFAULT 0,
  terms           TEXT,
  status          VARCHAR(30) DEFAULT 'draft',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS capital_calls (
  id              SERIAL PRIMARY KEY,
  call_id         VARCHAR(50) UNIQUE,
  fund_id         VARCHAR(50),
  period          VARCHAR(20),
  amount_usd      BIGINT DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'issued',
  due_date        DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distributions (
  id              SERIAL PRIMARY KEY,
  dist_id         VARCHAR(50) UNIQUE,
  fund_id         VARCHAR(50),
  period          VARCHAR(20),
  amount_usd      BIGINT DEFAULT 0,
  type            VARCHAR(30),
  status          VARCHAR(30) DEFAULT 'announced',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS advisors (
  id              SERIAL PRIMARY KEY,
  advisor_id      VARCHAR(50) UNIQUE,
  name            VARCHAR(150),
  firm            VARCHAR(150),
  expertise       VARCHAR(200),
  fund_id         VARCHAR(50),
  status          VARCHAR(30) DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intros (
  id              SERIAL PRIMARY KEY,
  intro_id        VARCHAR(50) UNIQUE,
  source          VARCHAR(150),
  target          VARCHAR(150),
  company_id      VARCHAR(50),
  status          VARCHAR(30) DEFAULT 'pending',
  made_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pipeline_notes (
  id              SERIAL PRIMARY KEY,
  note_id         VARCHAR(50) UNIQUE,
  deal_id         VARCHAR(50),
  author          VARCHAR(150),
  note            TEXT,
  sentiment       VARCHAR(20) DEFAULT 'neutral',
  ts              TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exits (
  id              SERIAL PRIMARY KEY,
  exit_id         VARCHAR(50) UNIQUE,
  company_id      VARCHAR(50),
  type            VARCHAR(40),
  value_usd       BIGINT DEFAULT 0,
  multiple        NUMERIC(10,2) DEFAULT 0,
  closed_at       DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id              SERIAL PRIMARY KEY,
  entry_id        VARCHAR(50) UNIQUE,
  actor           VARCHAR(150),
  target          VARCHAR(200),
  action          VARCHAR(80),
  result          VARCHAR(40),
  ts              TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
