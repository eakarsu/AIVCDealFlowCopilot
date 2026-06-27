const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'collaboration_comments',
  fields: ['comment_id','resource_type','resource_id','author','body','visibility','status'],
});
