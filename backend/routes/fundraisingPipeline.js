const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'fundraising_pipeline',
  fields: ['raise_id','fund_id','lp_name','stage','target_commitment_usd','probability_pct','next_step','next_touch_date','owner','notes'],
});
