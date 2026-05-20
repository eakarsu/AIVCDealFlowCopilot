import React from 'react';
import CrudPage from '../components/CrudPage';
import { icMemosApi } from '../services/api';

export default function IcMemosPage() {
  return (
    <CrudPage
      title="IC Memos"
      subtitle="Investment committee memos by deal and version."
      api={icMemosApi}
      statusKey="status"
      fields={[
        { key: 'memo_id',        label: 'Memo ID' },
        { key: 'deal_id',        label: 'Deal ID' },
        { key: 'author',         label: 'Author' },
        { key: 'version',        label: 'Version', type: 'number' },
        { key: 'recommendation', label: 'Recommendation', type: 'select', options: ['invest','invest_with_conditions','pass','follow_up'] },
        { key: 'status',         label: 'Status', type: 'select', options: ['draft','in_review','approved','closed'] },
        { key: 'notes',          label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
