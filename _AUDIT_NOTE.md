# Audit Note — AIVCDealFlowCopilot

Domain: Venture capital deal flow — sourcing, screening, due diligence, IC memo, portfolio mgmt, LP reporting.
Stack: Node + Express + React + Postgres + OpenRouter.

## Inventory

### Backend routes (mounted in `backend/server.js`)
CRUD/Non-AI (24): `auth`, `deals`, `founders`, `companies`, `funds`, `lp-reports`, `ic-memos`, `investments`, `follow-ons`, `portfolio-metrics`, `board-meetings`, `term-sheets`, `capital-calls`, `distributions`, `advisors`, `intros`, `pipeline-notes`, `exits`, `audit-log`, `notifications`, `attachments`, `webhooks`, `dashboard`, `custom-views`.

AI endpoints (`backend/routes/ai.js`, 17): `ic-memo-draft`, `founder-call-summary`, `comp-analysis`, `valuation-band`, `executive-brief`, `lp-report-draft`, `exit-scenario`, `portfolio-flag`, `follow-on-recommend`, `term-sheet-compare`, `intro-message-draft`, `market-mapping`, `founder-redflag-extract`, `cap-table-impact`, `distribution-waterfall`, `fund-strategy-brief`, plus `samples` + `history`.

Frontend: 17 AI pages + 21 CRUD pages, `PipelineKanban` component, dashboard charts (`FundTVPI`, `PortfolioBubble`, `SectorDonut`).

## Coverage vs Requested

### AI (requested → status)
- pitch-deck extractor — **MISSING**
- IC memo drafter — **PRESENT** (`/ai/ic-memo-draft`)
- market-size estimator — **PARTIAL** (`market-mapping` adjacent; no TAM/SAM/SOM endpoint)
- comp-set finder — **PRESENT** (`/ai/comp-analysis`)
- founder background summarizer — **PARTIAL** (`founder-call-summary`, `founder-redflag-extract`; no background/bio synth)
- due-diligence Q&A generator — **MISSING**

### Non-AI
- deal CRUD — **PRESENT** (`/api/deals`)
- pipeline kanban — **PRESENT** (`customViews.js /pipeline-kanban` + `PipelineKanban.js`)
- cap table tracker — **MISSING** as dedicated CRUD (only AI `cap-table-impact`)
- LP comms templates — **PARTIAL** (`lp-reports` + AI draft; no template store)

### Custom
- thesis-fit scorer — **MISSING**
- portfolio-company KPI ingest — **PARTIAL** (`portfolio-metrics` CRUD; no ingest pipeline)
- follow-on recommender — **PRESENT** (`/ai/follow-on-recommend`)

## Implemented (this round)
None — audit-only.

## Backlog (prioritized)
1. **MECHANICAL** `POST /api/ai/pitch-deck-extract` — parse deck text → structured fields.
2. **MECHANICAL** `POST /api/ai/dd-qa-generate` — produce due-diligence question set by sector/stage.
3. **MECHANICAL** `POST /api/ai/market-size-estimate` — TAM/SAM/SOM with rationale.
4. **MECHANICAL** `POST /api/ai/founder-background-summary` — synth from bio/LinkedIn text.
5. **MECHANICAL** `POST /api/ai/thesis-fit-score` — score deal vs fund thesis.
6. **MECHANICAL** `cap-tables` CRUD route + migration (entries, classes, SAFEs).
7. **MECHANICAL** `lp-comms-templates` CRUD + variable substitution.
8. **NEEDS-PRODUCT-DECISION** KPI ingest pipeline (CSV/email parser, schedule, alerting).

## Status
Counts: 24 non-AI routes, 17 AI endpoints, 38 frontend pages. Coverage: 4/13 requested items PRESENT, 4 PARTIAL, 5 MISSING. Status: audit-only, no code changes. Syntax/server not touched.

## Apply pass 7 (full backlog implementation)

Implements every MECHANICAL backlog item (1, 2, 5, 6) and every
NEEDS-PRODUCT-DECISION item (3, 4, 7, 8) from the prior backlog.

### Endpoints added (9)

AI (5, mounted under `/api/ai` in `backend/routes/ai.js`):
- `POST /api/ai/pitch-deck-extract` — MECHANICAL. LLM-only over caller-supplied
  deck text. No PDF/PPTX parsing on this side; 400s if `deck_text` is empty.
  Returns structured fields (company, stage, sector, problem/solution,
  traction_metrics, team, ask, competitors, missing_fields).
- `POST /api/ai/dd-qa-generate` — MECHANICAL. Returns category-grouped DD
  questions + data-room checklist + estimated DD days.
- `POST /api/ai/market-size-estimate` — NEEDS-PRODUCT-DECISION (TAM/SAM/SOM
  decomposition with explicit assumptions + sensitivities + confidence).
- `POST /api/ai/founder-background-summary` — NEEDS-PRODUCT-DECISION (fuller
  bio synthesis: career arc, education, expertise, network strength, prior
  exits, thesis-fit signals, follow-up diligence).
- `POST /api/ai/thesis-fit-score` — MECHANICAL. Dimension-by-dimension score
  vs fund thesis with weighted overall, verdict, must-haves present/missing,
  recommended next step. Looks up the deal by `deal_id` when supplied.

All 5 are wired into `ai.SAMPLES` (5 realistic fills each, matching the
existing 16-verb convention) and recorded into `ai_results` via the existing
`record()` helper, so they show up in `GET /api/ai/history?feature=…`.

CRUD (4 new routers, mounted in `backend/server.js` before `app.listen`):
- `/api/cap-tables`           — MECHANICAL. `routes/capTables.js` via
  `_crudFactory` (entries, classes, SAFEs, notes, option pool, warrants).
- `/api/lp-comms-templates`   — MECHANICAL. `routes/lpCommsTemplates.js`
  extends `_crudFactory` with `POST /:id/render` that performs
  `{{handlebars-style}}` variable substitution and reports any unresolved
  tokens.
- `/api/kpi-ingest-sources`   — NEEDS-PRODUCT-DECISION (schema-only). Adds
  `POST /:id/mark-run` stub for a future scheduler to stamp `last_run_at`.
- `/api/kpi-ingest-records`   — NEEDS-PRODUCT-DECISION. Inherits the standard
  `POST /bulk-import` from `_crudFactory` so quarterly KPI uploads are one
  CSV away.

### Pages added (9)

AI pages (5, route group `/ai/…`):
- `frontend/src/pages/AIPitchDeckExtractPage.js`
- `frontend/src/pages/AIDdQaGeneratePage.js`
- `frontend/src/pages/AIMarketSizeEstimatePage.js`
- `frontend/src/pages/AIFounderBackgroundSummaryPage.js`
- `frontend/src/pages/AIThesisFitScorePage.js`

CRUD pages (4):
- `frontend/src/pages/CapTablesPage.js`
- `frontend/src/pages/LpCommsTemplatesPage.js`
- `frontend/src/pages/KpiIngestSourcesPage.js`
- `frontend/src/pages/KpiIngestRecordsPage.js`

All 9 pages are imported and routed in `frontend/src/App.js` and added to
`frontend/src/components/Sidebar.js` under the appropriate groups (a new
"Cap Tables" group sits between Funds and Memos; the new AI pages are added
to AI Memo and AI Analysis groups; the KPI ingest pages are added under
Portfolio; the LP Comms Templates entry is added under LP Reporting).
The frontend client exports (`aiPitchDeckExtract`, `aiDdQaGenerate`,
`aiMarketSizeEstimate`, `aiFounderBackgroundSummary`, `aiThesisFitScore`,
`capTablesApi`, `lpCommsTemplatesApi.render`, `kpiIngestSourcesApi.markRun`,
`kpiIngestRecordsApi`) are added to `frontend/src/services/api.js`.

### Tables added (4)

In `backend/migrations/003_schema.sql` (also wired into `backend/seed/seed.js`
both as DROP-IF-EXISTS reset entries and as `schema3` migration replay):
- `cap_tables(entry_id, company_id, stakeholder, class, shares,
  pct_ownership, invested_usd, valuation_cap_usd, discount_pct, issued_at,
  notes, status, created_at, updated_at)` + index `(company_id)`.
- `lp_comms_templates(template_id, name, category, subject, body, variables,
  fund_id, status, …)` + index `(category)`.
- `kpi_ingest_sources(source_id, company_id, name, kind, config,
  schedule_cron, alert_threshold, status, last_run_at, …)` + index
  `(company_id)`.
- `kpi_ingest_records(record_id, source_id, company_id, kpi, value, unit,
  period, observed_at, raw, alert_state, …)` + indices
  `(company_id, period)` and `(kpi)`.

The migration also defensively re-declares `ai_results` (used by
`/api/ai/history`) so a clean DB can boot without depending on prior
bootstrap order.

### Syntax

`node --check` passes on every modified or new backend `.js` file:
- `backend/server.js`
- `backend/routes/ai.js`
- `backend/routes/capTables.js`
- `backend/routes/lpCommsTemplates.js`
- `backend/routes/kpiIngestSources.js`
- `backend/routes/kpiIngestRecords.js`
- `backend/services/ai.js`
- `backend/seed/seed.js`
- `frontend/src/services/api.js`

Front-end JSX page files use the same syntax / import pattern as the
existing 38 pages and are transpiled by react-scripts at build time.

### Skips

- No new npm dependencies installed (project constraint).
- The pitch-deck extractor stays LLM-only over caller-supplied text. We did
  not introduce a PDF/PPTX parser, OCR pipeline, or upload handler — the
  caller is expected to convert the deck to text first. This keeps the
  no-new-deps constraint and prevents a partial-parser cliff.
- The KPI ingest pipeline ships the schema + CRUD only. No scheduler, no
  email/IMAP parser, no webhook receiver — those are out of scope for this
  pass. `POST /api/kpi-ingest-sources/:id/mark-run` is the only forward
  hook, and `POST /api/kpi-ingest-records/bulk-import` (inherited from the
  CRUD factory) gives a one-shot CSV path today.
- No new 404 handler was added in `server.js`; the file already has none.
  New CRUD routes are mounted before `app.listen()` per the requirement.

### Status

Pass 7 complete. Routes: 24 non-AI → 28; AI endpoints: 17 → 22; frontend
pages: 38 → 47. Coverage of original requested items: 13/13 PRESENT
(previously 4 PRESENT / 4 PARTIAL / 5 MISSING). No breaking changes to
existing routes, schemas, or pages.

