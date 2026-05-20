-- AIVCDealFlowCopilot core schema
-- 9 of 18 entities live here. Remainder + RBAC/notifications/attachments/webhooks in 002.

CREATE TABLE IF NOT EXISTS deals (
  id              SERIAL PRIMARY KEY,
  deal_id         VARCHAR(50) UNIQUE,
  company_name    VARCHAR(200) NOT NULL,
  stage           VARCHAR(40),
  sector          VARCHAR(80),
  round_size_usd  BIGINT DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'sourced',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS founders (
  id              SERIAL PRIMARY KEY,
  founder_id      VARCHAR(50) UNIQUE,
  name            VARCHAR(150),
  company_id      VARCHAR(50),
  role            VARCHAR(80),
  linkedin        VARCHAR(300),
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id              SERIAL PRIMARY KEY,
  company_id      VARCHAR(50) UNIQUE,
  name            VARCHAR(200),
  sector          VARCHAR(80),
  country         VARCHAR(80),
  hq              VARCHAR(150),
  status          VARCHAR(30) DEFAULT 'tracked',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS funds (
  id              SERIAL PRIMARY KEY,
  fund_id         VARCHAR(50) UNIQUE,
  name            VARCHAR(200),
  vintage         INTEGER,
  size_usd        BIGINT DEFAULT 0,
  gp_commit_usd   BIGINT DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'investing',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lp_reports (
  id              SERIAL PRIMARY KEY,
  report_id       VARCHAR(50) UNIQUE,
  fund_id         VARCHAR(50),
  period          VARCHAR(20),
  nav_usd         BIGINT DEFAULT 0,
  dpi             NUMERIC(8,3) DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'draft',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ic_memos (
  id              SERIAL PRIMARY KEY,
  memo_id         VARCHAR(50) UNIQUE,
  deal_id         VARCHAR(50),
  author          VARCHAR(150),
  version         INTEGER DEFAULT 1,
  recommendation  VARCHAR(40),
  status          VARCHAR(30) DEFAULT 'draft',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investments (
  id              SERIAL PRIMARY KEY,
  inv_id          VARCHAR(50) UNIQUE,
  deal_id         VARCHAR(50),
  fund_id         VARCHAR(50),
  amount_usd      BIGINT DEFAULT 0,
  valuation_usd   BIGINT DEFAULT 0,
  closed_at       DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follow_ons (
  id              SERIAL PRIMARY KEY,
  fo_id           VARCHAR(50) UNIQUE,
  inv_id          VARCHAR(50),
  round           VARCHAR(40),
  amount_usd      BIGINT DEFAULT 0,
  ownership_pct   NUMERIC(8,4) DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'considering',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_metrics (
  id              SERIAL PRIMARY KEY,
  metric_id       VARCHAR(50) UNIQUE,
  company_id      VARCHAR(50),
  kpi             VARCHAR(80),
  value           NUMERIC(20,4) DEFAULT 0,
  period          VARCHAR(20),
  source          VARCHAR(80),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_results (
  id              SERIAL PRIMARY KEY,
  feature         VARCHAR(80) NOT NULL,
  input           JSONB,
  output          JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_results_feature_created
  ON ai_results (feature, created_at DESC);
