const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'follow_ons',
  fields: ['fo_id','inv_id','round','amount_usd','ownership_pct','status','notes'],
});
