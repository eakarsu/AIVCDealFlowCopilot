const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'exits',
  fields: ['exit_id','company_id','type','value_usd','multiple','closed_at'],
});
