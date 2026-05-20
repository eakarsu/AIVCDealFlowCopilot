const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'portfolio_metrics',
  fields: ['metric_id','company_id','kpi','value','period','source','notes'],
});
