// KPI ingest sources — declared channels (csv_upload, email, webhook, gsheet,
// manual) that feed portfolio-company KPI records.
// Schema: backend/migrations/003_schema.sql · kpi_ingest_sources
//
// NEEDS-PRODUCT-DECISION (backlog item 8): the actual fetch / parse pipeline is
// out of scope for this pass — this route persists the declarations and
// exposes an idempotent `POST /:id/mark-run` so a future scheduler can stamp
// `last_run_at` after a successful pull. The schema is the contract.

const express = require('express');
const pool = require('../config/database');
const { requireWriter } = require('../middleware/auth');
const buildCrud = require('./_crudFactory');

const baseRouter = buildCrud({
  table: 'kpi_ingest_sources',
  fields: [
    'source_id',
    'company_id',
    'name',
    'kind',
    'config',
    'schedule_cron',
    'alert_threshold',
    'status',
    'last_run_at',
  ],
});

const router = express.Router();

// POST /api/kpi-ingest-sources/:id/mark-run — stub for a future scheduler hook
router.post('/:id/mark-run', requireWriter, async (req, res) => {
  try {
    const r = await pool.query(
      'UPDATE kpi_ingest_sources SET last_run_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.use(baseRouter);

module.exports = router;
