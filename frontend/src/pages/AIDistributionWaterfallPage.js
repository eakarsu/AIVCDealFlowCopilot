import React from 'react';
import AIPage from '../components/AIPage';
import { aiDistributionWaterfall } from '../services/api';

export default function AIDistributionWaterfallPage() {
  return (
    <AIPage
      title="AI · Distribution Waterfall"
      feature="distribution-waterfall"
      subtitle="Compute LP/GP waterfall tiers for a given exit proceeds and fund terms."
      inputs={[
        { key: 'fund',             label: 'Fund ID',           placeholder: 'FUND-III, FUND-IV, ...' },
        { key: 'exit_proceeds_usd',label: 'Exit Proceeds (USD)', type: 'number' },
        { key: 'context_notes',    label: 'Fund Terms (hurdle, carry, waterfall type)', type: 'textarea' },
      ]}
      run={(v) => aiDistributionWaterfall(v)}
    />
  );
}
