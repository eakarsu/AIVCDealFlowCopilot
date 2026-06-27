const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'saved_searches',
  fields: ['search_id','name','scope','query','owner','alert_enabled','notes'],
});
