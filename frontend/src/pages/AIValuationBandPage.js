import React from 'react';
import AIPage from '../components/AIPage';
import { aiValuationBand } from '../services/api';

export default function AIValuationBandPage() {
  return (
    <AIPage
      title="AI · Valuation Band"
      feature="valuation-band"
      subtitle="Compute a defensible valuation band across multiple methodologies."
      inputs={[
        { key: 'company_name', label: 'Company' },
        { key: 'metrics_text', label: 'Metrics (ARR, growth, margins, etc.)', type: 'textarea' },
      ]}
      run={(v) => aiValuationBand(v)}
    />
  );
}
