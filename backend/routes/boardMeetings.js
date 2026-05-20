const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'board_meetings',
  fields: ['meeting_id','company_id','date','attendees_count','agenda','notes_url'],
});
