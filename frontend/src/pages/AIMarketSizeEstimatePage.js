import React from 'react';
import AIPage from '../components/AIPage';
import { aiMarketSizeEstimate } from '../services/api';

export default function AIMarketSizeEstimatePage() {
  return (
    <AIPage
      title="AI · Market Size Estimate"
      feature="market-size-estimate"
      subtitle="Defensible TAM / SAM / SOM with explicit assumptions, sensitivities and confidence."
      inputs={[
        { key: 'product_or_sector', label: 'Product / Sector',
          placeholder: 'Enterprise AI agents for regulated industries' },
        { key: 'context_notes',     label: 'Approach / Constraints', type: 'textarea',
          placeholder: 'Bottom-up vs top-down preference, geography filters, time horizon…' },
      ]}
      run={(v) => aiMarketSizeEstimate(v)}
    />
  );
}
