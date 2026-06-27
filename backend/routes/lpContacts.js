const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'lp_contacts',
  fields: ['contact_id','lp_name','contact_name','email','role','geography','commitment_usd','status','notes'],
});
