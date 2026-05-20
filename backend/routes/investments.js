const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'investments',
  fields: ['inv_id','deal_id','fund_id','amount_usd','valuation_usd','closed_at','notes'],
});
