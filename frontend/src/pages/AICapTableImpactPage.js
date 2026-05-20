import React from 'react';
import AIPage from '../components/AIPage';
import { aiCapTableImpact } from '../services/api';

export default function AICapTableImpactPage() {
  return (
    <AIPage
      title="AI · Cap Table Impact"
      feature="cap-table-impact"
      subtitle="Model dilution and stakeholder impact from a proposed round."
      inputs={[
        { key: 'company_name',         label: 'Company' },
        { key: 'cap_table_text',       label: 'Current Cap Table (stakeholder / pct)', type: 'textarea' },
        { key: 'proposed_round_text',  label: 'Proposed Round (pre, size, pool)',       type: 'textarea' },
      ]}
      run={(v) => aiCapTableImpact(v)}
    />
  );
}
