const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'capital_calls',
  fields: ['call_id','fund_id','period','amount_usd','status','due_date'],
});
