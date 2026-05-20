const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'companies',
  fields: ['company_id','name','sector','country','hq','status','notes'],
});
