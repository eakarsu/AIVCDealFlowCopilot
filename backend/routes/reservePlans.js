const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'reserve_plans',
  fields: ['plan_id','fund_id','company_id','current_ownership_pct','reserve_amount_usd','scenario','recommendation','notes'],
});
