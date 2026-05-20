const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'term_sheets',
  fields: ['ts_id','deal_id','version','valuation_usd','terms','status'],
});
