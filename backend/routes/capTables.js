// Cap table CRUD — one row per stakeholder line item (founder, employee
// option pool, investor share class, SAFE, convertible note, warrant).
// Schema: backend/migrations/003_schema.sql · cap_tables
const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'cap_tables',
  fields: [
    'entry_id',
    'company_id',
    'stakeholder',
    'class',
    'shares',
    'pct_ownership',
    'invested_usd',
    'valuation_cap_usd',
    'discount_pct',
    'issued_at',
    'notes',
    'status',
  ],
});
