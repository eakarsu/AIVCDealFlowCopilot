import React from 'react';
import CrudPage from '../components/CrudPage';
import { introsApi } from '../services/api';

export default function IntrosPage() {
  return (
    <CrudPage
      title="Intros"
      subtitle="Inbound and outbound founder/operator intros."
      api={introsApi}
      statusKey="status"
      fields={[
        { key: 'intro_id',   label: 'Intro ID' },
        { key: 'source',     label: 'Source' },
        { key: 'target',     label: 'Target' },
        { key: 'company_id', label: 'Company ID' },
        { key: 'status',     label: 'Status', type: 'select', options: ['pending','completed','declined','passed'] },
        { key: 'made_at',    label: 'Made At', type: 'datetime-local' },
      ]}
    />
  );
}
