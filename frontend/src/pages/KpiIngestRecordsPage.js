import React from 'react';
import CrudPage from '../components/CrudPage';
import { kpiIngestRecordsApi } from '../services/api';

export default function KpiIngestRecordsPage() {
  return (
    <CrudPage
      title="KPI Ingest Records"
      subtitle="Ingested KPI observations (one row per kpi · company · period). CSV bulk-import supported."
      api={kpiIngestRecordsApi}
      statusKey="alert_state"
      fields={[
        { key: 'record_id',   label: 'Record ID' },
        { key: 'source_id',   label: 'Source ID' },
        { key: 'company_id',  label: 'Company ID' },
        { key: 'kpi',         label: 'KPI', placeholder: 'arr_usd, burn_usd, ndr_pct, runway_months…' },
        { key: 'value',       label: 'Value', type: 'number' },
        { key: 'unit',        label: 'Unit', type: 'select',
          options: ['usd','pct','months','count','ratio'] },
        { key: 'period',      label: 'Period', placeholder: '2026Q1 / 2026-04' },
        { key: 'observed_at', label: 'Observed At', type: 'date' },
        { key: 'alert_state', label: 'Alert State', type: 'select',
          options: ['ok','warning','critical'] },
        { key: 'raw',         label: 'Raw Source Row (audit)', type: 'textarea' },
      ]}
    />
  );
}
