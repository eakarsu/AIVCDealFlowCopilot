import React from 'react';
import CrudPage from '../components/CrudPage';
import { termSheetsApi } from '../services/api';

export default function TermSheetsPage() {
  return (
    <CrudPage
      title="Term Sheets"
      subtitle="Term sheet versions per deal."
      api={termSheetsApi}
      statusKey="status"
      fields={[
        { key: 'ts_id',         label: 'Term Sheet ID' },
        { key: 'deal_id',       label: 'Deal ID' },
        { key: 'version',       label: 'Version', type: 'number' },
        { key: 'valuation_usd', label: 'Valuation (USD)', type: 'number' },
        { key: 'terms',         label: 'Terms', type: 'textarea' },
        { key: 'status',        label: 'Status', type: 'select', options: ['draft','in_review','sent','signed','withdrawn'] },
      ]}
    />
  );
}
