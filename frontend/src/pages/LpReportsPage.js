import React from 'react';
import CrudPage from '../components/CrudPage';
import { lpReportsApi } from '../services/api';

export default function LpReportsPage() {
  return (
    <CrudPage
      title="LP Reports"
      subtitle="Quarterly LP reports across all funds."
      api={lpReportsApi}
      statusKey="status"
      fields={[
        { key: 'report_id', label: 'Report ID' },
        { key: 'fund_id',   label: 'Fund ID' },
        { key: 'period',    label: 'Period' },
        { key: 'nav_usd',   label: 'NAV (USD)', type: 'number' },
        { key: 'dpi',       label: 'DPI',       type: 'number' },
        { key: 'status',    label: 'Status', type: 'select', options: ['draft','review','distributed','final'] },
        { key: 'notes',     label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
