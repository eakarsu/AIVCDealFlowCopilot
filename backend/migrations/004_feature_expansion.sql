-- AIVCDealFlowCopilot v4 feature expansion
-- Adds diligence/data-room workflows, LP CRM, fund operations, collaboration,
-- access controls, and saved search records.

CREATE TABLE IF NOT EXISTS data_room_documents (
  id               SERIAL PRIMARY KEY,
  doc_id           VARCHAR(50) UNIQUE,
  deal_id          VARCHAR(50),
  company_id       VARCHAR(50),
  title            VARCHAR(240),
  category         VARCHAR(80),
  confidentiality  VARCHAR(40),
  owner            VARCHAR(120),
  status           VARCHAR(40) DEFAULT 'indexed',
  uploaded_at      TIMESTAMPTZ,
  summary          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_data_room_documents_deal ON data_room_documents (deal_id);
CREATE INDEX IF NOT EXISTS idx_data_room_documents_company ON data_room_documents (company_id);

CREATE TABLE IF NOT EXISTS diligence_tasks (
  id          SERIAL PRIMARY KEY,
  task_id     VARCHAR(50) UNIQUE,
  deal_id     VARCHAR(50),
  workstream  VARCHAR(80),
  title       VARCHAR(240),
  owner       VARCHAR(120),
  priority    VARCHAR(30),
  status      VARCHAR(40) DEFAULT 'open',
  due_date    DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_diligence_tasks_deal ON diligence_tasks (deal_id);

CREATE TABLE IF NOT EXISTS lp_contacts (
  id                 SERIAL PRIMARY KEY,
  contact_id         VARCHAR(50) UNIQUE,
  lp_name            VARCHAR(180),
  contact_name       VARCHAR(160),
  email              VARCHAR(180),
  role               VARCHAR(80),
  geography          VARCHAR(80),
  commitment_usd     BIGINT DEFAULT 0,
  status             VARCHAR(40) DEFAULT 'active',
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lp_contacts_lp ON lp_contacts (lp_name);

CREATE TABLE IF NOT EXISTS fundraising_pipeline (
  id                     SERIAL PRIMARY KEY,
  raise_id               VARCHAR(50) UNIQUE,
  fund_id                VARCHAR(50),
  lp_name                VARCHAR(180),
  stage                  VARCHAR(50),
  target_commitment_usd  BIGINT DEFAULT 0,
  probability_pct        NUMERIC(6,2) DEFAULT 0,
  next_step              VARCHAR(240),
  next_touch_date        DATE,
  owner                  VARCHAR(120),
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fundraising_pipeline_fund ON fundraising_pipeline (fund_id);

CREATE TABLE IF NOT EXISTS portfolio_updates (
  id              SERIAL PRIMARY KEY,
  update_id       VARCHAR(50) UNIQUE,
  company_id      VARCHAR(50),
  period          VARCHAR(30),
  arr_usd         BIGINT DEFAULT 0,
  burn_usd        BIGINT DEFAULT 0,
  runway_months   NUMERIC(8,2) DEFAULT 0,
  highlights      TEXT,
  asks            TEXT,
  status          VARCHAR(40) DEFAULT 'received',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_updates_company ON portfolio_updates (company_id);

CREATE TABLE IF NOT EXISTS fund_expenses (
  id               SERIAL PRIMARY KEY,
  expense_id       VARCHAR(50) UNIQUE,
  fund_id          VARCHAR(50),
  category         VARCHAR(80),
  vendor           VARCHAR(180),
  amount_usd       BIGINT DEFAULT 0,
  period           VARCHAR(30),
  approval_status  VARCHAR(40) DEFAULT 'pending',
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fund_expenses_fund ON fund_expenses (fund_id);

CREATE TABLE IF NOT EXISTS reserve_plans (
  id                     SERIAL PRIMARY KEY,
  plan_id                VARCHAR(50) UNIQUE,
  fund_id                VARCHAR(50),
  company_id             VARCHAR(50),
  current_ownership_pct  NUMERIC(8,4) DEFAULT 0,
  reserve_amount_usd     BIGINT DEFAULT 0,
  scenario               VARCHAR(80),
  recommendation         VARCHAR(80),
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reserve_plans_fund_company ON reserve_plans (fund_id, company_id);

CREATE TABLE IF NOT EXISTS collaboration_comments (
  id             SERIAL PRIMARY KEY,
  comment_id     VARCHAR(50) UNIQUE,
  resource_type  VARCHAR(80),
  resource_id    VARCHAR(80),
  author         VARCHAR(120),
  body           TEXT,
  visibility     VARCHAR(40) DEFAULT 'internal',
  status         VARCHAR(40) DEFAULT 'open',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_collaboration_comments_resource ON collaboration_comments (resource_type, resource_id);

CREATE TABLE IF NOT EXISTS access_rules (
  id             SERIAL PRIMARY KEY,
  rule_id        VARCHAR(50) UNIQUE,
  subject_type   VARCHAR(40),
  subject        VARCHAR(160),
  resource_type  VARCHAR(80),
  resource_id    VARCHAR(80),
  permission     VARCHAR(40),
  status         VARCHAR(40) DEFAULT 'active',
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_access_rules_resource ON access_rules (resource_type, resource_id);

CREATE TABLE IF NOT EXISTS saved_searches (
  id             SERIAL PRIMARY KEY,
  search_id      VARCHAR(50) UNIQUE,
  name           VARCHAR(160),
  scope          VARCHAR(80),
  query          TEXT,
  owner          VARCHAR(120),
  alert_enabled  BOOLEAN DEFAULT FALSE,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
