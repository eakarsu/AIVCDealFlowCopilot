const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'diligence_tasks',
  fields: ['task_id','deal_id','workstream','title','owner','priority','status','due_date','notes'],
});
