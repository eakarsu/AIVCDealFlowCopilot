import React from 'react';
import AIPage from '../components/AIPage';
import { aiFundStrategyBrief } from '../services/api';

export default function AIFundStrategyBriefPage() {
  return (
    <AIPage
      title="AI · Fund Strategy Brief"
      feature="fund-strategy-brief"
      subtitle="Assess deployment pace, concentration, reserves and LP messaging for a fund."
      inputs={[
        { key: 'fund_id', label: 'Fund ID', placeholder: 'FUND-IV, FUND-AI, FUND-CLI, ...' },
        { key: 'notes',   label: 'Context / Concerns', type: 'textarea' },
      ]}
      run={(v) => aiFundStrategyBrief(v)}
    />
  );
}
