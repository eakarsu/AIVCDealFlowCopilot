import React from 'react';
import CrudPage from '../components/CrudPage';
import { distributionsApi } from '../services/api';

export default function DistributionsPage() {
  return (
    <CrudPage
      title="Distributions"
      subtitle="LP distributions by fund and period."
      api={distributionsApi}
      statusKey="status"
      fields={[
        { key: 'dist_id',    label: 'Distribution ID' },
        { key: 'fund_id',    label: 'Fund ID' },
        { key: 'period',     label: 'Period' },
        { key: 'amount_usd', label: 'Amount (USD)', type: 'number' },
        { key: 'type',       label: 'Type', type: 'select', options: ['cash','in_kind','recallable'] },
        { key: 'status',     label: 'Status', type: 'select', options: ['announced','completed','reversed'] },
      ]}
    />
  );
}
