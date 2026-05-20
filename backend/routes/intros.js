const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'intros',
  fields: ['intro_id','source','target','company_id','status','made_at'],
});
