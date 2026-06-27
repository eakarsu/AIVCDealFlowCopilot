const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'portfolio_updates',
  fields: ['update_id','company_id','period','arr_usd','burn_usd','runway_months','highlights','asks','status'],
});
