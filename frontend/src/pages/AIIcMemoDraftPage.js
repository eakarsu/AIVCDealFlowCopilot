import React from 'react';
import AIPage from '../components/AIPage';
import { aiIcMemoDraft } from '../services/api';

export default function AIIcMemoDraftPage() {
  return (
    <AIPage
      title="AI · IC Memo Draft"
      feature="ic-memo-draft"
      subtitle="Generate a full investment-committee memo from deal context."
      inputs={[
        { key: 'company_name',   label: 'Company',         placeholder: 'e.g. Halcyon AI' },
        { key: 'stage',          label: 'Stage',           placeholder: 'seed | series_a | series_b | series_c | growth' },
        { key: 'sector',         label: 'Sector',          placeholder: 'enterprise_ai | climate | biotech | fintech | ...' },
        { key: 'round_size_usd', label: 'Round Size (USD)', type: 'number' },
        { key: 'valuation_usd',  label: 'Valuation (USD)',  type: 'number' },
        { key: 'notes',          label: 'Notes / Diligence Highlights', type: 'textarea' },
      ]}
      run={(v) => aiIcMemoDraft(v)}
    />
  );
}
