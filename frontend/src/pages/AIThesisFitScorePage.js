import React from 'react';
import AIPage from '../components/AIPage';
import { aiThesisFitScore } from '../services/api';

export default function AIThesisFitScorePage() {
  return (
    <AIPage
      title="AI · Thesis-Fit Score"
      feature="thesis-fit-score"
      subtitle="Score a deal vs the fund's stated thesis across sector, stage, geography, founder profile and market."
      inputs={[
        { key: 'deal_id',       label: 'Deal ID (optional — pulls deal row)', placeholder: 'DEAL-2026-001' },
        { key: 'company_name',  label: 'Company Name' },
        { key: 'deal_summary',  label: 'Deal Summary', type: 'textarea',
          placeholder: 'Stage, sector, round size, traction snapshot, founder profile…' },
        { key: 'thesis_text',   label: 'Fund Thesis', type: 'textarea',
          placeholder: 'Fund AI I invests in enterprise AI infrastructure and applied AI orchestration for regulated industries…' },
        { key: 'context_notes', label: 'Additional Context (optional)', type: 'textarea' },
      ]}
      run={(v) => aiThesisFitScore(v)}
    />
  );
}
