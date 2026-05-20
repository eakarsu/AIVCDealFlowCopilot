const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'lp_reports',
  fields: ['report_id','fund_id','period','nav_usd','dpi','status','notes'],
});
