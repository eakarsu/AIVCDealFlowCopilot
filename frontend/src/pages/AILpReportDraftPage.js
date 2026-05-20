import React from 'react';
import AIPage from '../components/AIPage';
import { aiLpReportDraft } from '../services/api';

export default function AILpReportDraftPage() {
  return (
    <AIPage
      title="AI · LP Report Draft"
      feature="lp-report-draft"
      subtitle="Draft a full quarterly LP report from fund + period context."
      inputs={[
        { key: 'fund',   label: 'Fund ID',  placeholder: 'FUND-III, FUND-IV, FUND-AI, ...' },
        { key: 'period', label: 'Period',   placeholder: '2026Q1' },
        { key: 'notes',  label: 'Highlights / Context', type: 'textarea' },
      ]}
      run={(v) => aiLpReportDraft(v)}
    />
  );
}
