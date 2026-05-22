import React from 'react';
import CrudPage from '../components/CrudPage';
import { kpiIngestSourcesApi } from '../services/api';

export default function KpiIngestSourcesPage() {
  return (
    <CrudPage
      title="KPI Ingest Sources"
      subtitle="Declared KPI ingest channels per portfolio company (CSV / email / webhook / sheet / manual)."
      api={kpiIngestSourcesApi}
      statusKey="status"
      fields={[
        { key: 'source_id',       label: 'Source ID' },
        { key: 'company_id',      label: 'Company ID' },
        { key: 'name',            label: 'Name' },
        { key: 'kind',            label: 'Kind', type: 'select',
          options: ['csv_upload','email','webhook','gsheet','manual'] },
        { key: 'config',          label: 'Config (JSON blob)', type: 'textarea' },
        { key: 'schedule_cron',   label: 'Schedule (cron expr)' },
        { key: 'alert_threshold', label: 'Alert Thresholds (JSON: kpi → bound)', type: 'textarea' },
        { key: 'status',          label: 'Status', type: 'select',
          options: ['active','paused','error','retired'] },
      ]}
    />
  );
}
