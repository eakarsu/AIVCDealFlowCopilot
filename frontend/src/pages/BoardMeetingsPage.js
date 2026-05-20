import React from 'react';
import CrudPage from '../components/CrudPage';
import { boardMeetingsApi } from '../services/api';

export default function BoardMeetingsPage() {
  return (
    <CrudPage
      title="Board Meetings"
      subtitle="Portfolio company board meetings."
      api={boardMeetingsApi}
      fields={[
        { key: 'meeting_id',      label: 'Meeting ID' },
        { key: 'company_id',      label: 'Company ID' },
        { key: 'date',            label: 'Date', type: 'date' },
        { key: 'attendees_count', label: 'Attendees', type: 'number' },
        { key: 'agenda',          label: 'Agenda', type: 'textarea' },
        { key: 'notes_url',       label: 'Notes URL' },
      ]}
    />
  );
}
