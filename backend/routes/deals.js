const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'deals',
  fields: ['deal_id','company_name','stage','sector','round_size_usd','status','notes'],
});
