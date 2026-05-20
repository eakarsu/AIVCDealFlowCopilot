import React from 'react';
import CrudPage from '../components/CrudPage';
import { portfolioMetricsApi } from '../services/api';

export default function PortfolioMetricsPage() {
  return (
    <CrudPage
      title="Portfolio Metrics"
      subtitle="KPI values reported by portfolio companies."
      api={portfolioMetricsApi}
      fields={[
        { key: 'metric_id',  label: 'Metric ID' },
        { key: 'company_id', label: 'Company ID' },
        { key: 'kpi',        label: 'KPI' },
        { key: 'value',      label: 'Value',  type: 'number' },
        { key: 'period',     label: 'Period' },
        { key: 'source',     label: 'Source' },
        { key: 'notes',      label: 'Notes',  type: 'textarea' },
      ]}
    />
  );
}
