const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'data_room_documents',
  fields: ['doc_id','deal_id','company_id','title','category','confidentiality','owner','status','uploaded_at','summary'],
});
