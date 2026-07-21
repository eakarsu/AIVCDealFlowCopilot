BEGIN;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS tenant_id TEXT;
CREATE TABLE IF NOT EXISTS vc_deal_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, deal_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'intake', version INTEGER NOT NULL DEFAULT 1,
  analyst_id TEXT, reviewer_id TEXT, explanation TEXT, effective_date DATE, period_locked BOOLEAN NOT NULL DEFAULT FALSE,
  override_reason TEXT, override_approved_by TEXT,
  created_by TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, idempotency_key), UNIQUE (tenant_id, id)
);
CREATE TABLE IF NOT EXISTS vc_financial_inputs (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, review_id UUID NOT NULL, source_type TEXT NOT NULL,
  source_record_id TEXT NOT NULL, amount_cents BIGINT NOT NULL, as_of_date DATE NOT NULL, input_version INTEGER NOT NULL CHECK (input_version > 0),
  reconciled_at TIMESTAMPTZ, correction_of BIGINT, payload JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, source_type, source_record_id, input_version)
);
CREATE TABLE IF NOT EXISTS vc_integration_deliveries (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, review_id UUID NOT NULL, provider_type TEXT NOT NULL,
  idempotency_key TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','acknowledged','retrying','dead_letter')),
  attempt_count INTEGER NOT NULL DEFAULT 0, next_attempt_at TIMESTAMPTZ, receipt JSONB, last_error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, provider_type, idempotency_key)
);
CREATE TABLE IF NOT EXISTS vc_backtests (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, review_id UUID, fixture_key TEXT NOT NULL, fixture_version INTEGER NOT NULL,
  expected_outcome JSONB NOT NULL, actual_outcome JSONB, correction_case BOOLEAN NOT NULL DEFAULT FALSE,
  late_data_case BOOLEAN NOT NULL DEFAULT FALSE, boundary_case BOOLEAN NOT NULL DEFAULT FALSE, measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, fixture_key, fixture_version)
);
CREATE TABLE IF NOT EXISTS vc_workflow_audit (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, review_id UUID NOT NULL, actor_id TEXT NOT NULL,
  action TEXT NOT NULL, from_status TEXT, to_status TEXT, record_version INTEGER NOT NULL, evidence JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION reject_vc_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'vc workflow audit is append-only'; END $$;
DROP TRIGGER IF EXISTS vc_audit_append_only ON vc_workflow_audit;
CREATE TRIGGER vc_audit_append_only BEFORE UPDATE OR DELETE ON vc_workflow_audit FOR EACH ROW EXECUTE FUNCTION reject_vc_audit_mutation();
ALTER TABLE IF EXISTS users ALTER COLUMN password TYPE TEXT;
COMMIT;
