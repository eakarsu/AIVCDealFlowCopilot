const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'pipeline_notes',
  fields: ['note_id','deal_id','author','note','sentiment','ts'],
});
