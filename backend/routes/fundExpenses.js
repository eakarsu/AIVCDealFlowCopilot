const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'fund_expenses',
  fields: ['expense_id','fund_id','category','vendor','amount_usd','period','approval_status','notes'],
});
