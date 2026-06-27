const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'access_rules',
  fields: ['rule_id','subject_type','subject','resource_type','resource_id','permission','status','notes'],
});
