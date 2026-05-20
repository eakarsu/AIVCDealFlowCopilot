import React from 'react';
import CrudPage from '../components/CrudPage';
import { pipelineNotesApi } from '../services/api';

export default function PipelineNotesPage() {
  return (
    <CrudPage
      title="Pipeline Notes"
      subtitle="Partner notes timestamped against deals."
      api={pipelineNotesApi}
      statusKey="sentiment"
      fields={[
        { key: 'note_id',   label: 'Note ID' },
        { key: 'deal_id',   label: 'Deal ID' },
        { key: 'author',    label: 'Author' },
        { key: 'note',      label: 'Note', type: 'textarea' },
        { key: 'sentiment', label: 'Sentiment', type: 'select', options: ['positive','neutral','negative'] },
        { key: 'ts',        label: 'Timestamp', type: 'datetime-local' },
      ]}
    />
  );
}
