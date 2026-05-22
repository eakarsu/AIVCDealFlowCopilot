// KPI ingest records — one row per ingested KPI observation.
// Schema: backend/migrations/003_schema.sql · kpi_ingest_records
// Bulk CSV upload is inherited from the CRUD factory at
//   POST /api/kpi-ingest-records/bulk-import
const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'kpi_ingest_records',
  fields: [
    'record_id',
    'source_id',
    'company_id',
    'kpi',
    'value',
    'unit',
    'period',
    'observed_at',
    'raw',
    'alert_state',
  ],
});
