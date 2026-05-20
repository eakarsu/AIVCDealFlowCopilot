const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'ic_memos',
  fields: ['memo_id','deal_id','author','version','recommendation','status','notes'],
});
