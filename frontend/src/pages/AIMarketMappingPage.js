import React from 'react';
import AIPage from '../components/AIPage';
import { aiMarketMapping } from '../services/api';

export default function AIMarketMappingPage() {
  return (
    <AIPage
      title="AI · Market Mapping"
      feature="market-mapping"
      subtitle="Build a segmented market map: incumbents, challengers, whitespace, drivers."
      inputs={[
        { key: 'sector',      label: 'Sector', placeholder: 'enterprise AI agents, grid-scale storage, ...' },
        { key: 'focus_notes', label: 'Focus / Sub-segments', type: 'textarea' },
      ]}
      run={(v) => aiMarketMapping(v)}
    />
  );
}
