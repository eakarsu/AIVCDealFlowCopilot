import React from 'react';
import CrudPage from '../components/CrudPage';
import { fundsApi } from '../services/api';

export default function FundsPage() {
  return (
    <CrudPage
      title="Funds"
      subtitle="Active, harvesting and wound-down funds."
      api={fundsApi}
      statusKey="status"
      fields={[
        { key: 'fund_id',       label: 'Fund ID' },
        { key: 'name',          label: 'Name' },
        { key: 'vintage',       label: 'Vintage', type: 'number' },
        { key: 'size_usd',      label: 'Size (USD)', type: 'number' },
        { key: 'gp_commit_usd', label: 'GP Commit (USD)', type: 'number' },
        { key: 'status',        label: 'Status', type: 'select', options: ['investing','harvesting','wound_down'] },
        { key: 'notes',         label: 'Notes',  type: 'textarea' },
      ]}
    />
  );
}
