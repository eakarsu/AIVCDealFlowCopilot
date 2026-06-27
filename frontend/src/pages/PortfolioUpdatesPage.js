import React from 'react';
import CrudPage from '../components/CrudPage';
import { portfolioUpdatesApi } from '../services/api';

export default function PortfolioUpdatesPage() {
  return (
    <CrudPage
      title="Portfolio Updates"
      subtitle="Monthly or quarterly founder updates with ARR, burn, runway, highlights and asks."
      api={portfolioUpdatesApi}
      statusKey="status"
      fields={[
        { key: 'update_id', label: 'Update ID' },
        { key: 'company_id', label: 'Company ID' },
        { key: 'period', label: 'Period' },
        { key: 'arr_usd', label: 'ARR (USD)', type: 'number' },
        { key: 'burn_usd', label: 'Burn (USD)', type: 'number' },
        { key: 'runway_months', label: 'Runway Months', type: 'number' },
        { key: 'highlights', label: 'Highlights', type: 'textarea' },
        { key: 'asks', label: 'Asks', type: 'textarea' },
        { key: 'status', label: 'Status', type: 'select', options: ['received','reviewed','needs_followup','archived'] },
      ]}
    />
  );
}
