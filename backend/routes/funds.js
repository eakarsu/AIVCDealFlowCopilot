const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'funds',
  fields: ['fund_id','name','vintage','size_usd','gp_commit_usd','status','notes'],
});
