const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'founders',
  fields: ['founder_id','name','company_id','role','linkedin','status','notes'],
});
