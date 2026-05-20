const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'distributions',
  fields: ['dist_id','fund_id','period','amount_usd','type','status'],
});
