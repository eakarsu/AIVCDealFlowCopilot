import React from 'react';
import AIPage from '../components/AIPage';
import { aiExitScenario } from '../services/api';

export default function AIExitScenarioPage() {
  return (
    <AIPage
      title="AI · Exit Scenario"
      feature="exit-scenario"
      subtitle="Model probability-weighted exit scenarios for a portfolio company."
      inputs={[
        { key: 'company_name',  label: 'Company' },
        { key: 'context_notes', label: 'Context (ARR, owners, exit acquirer hints)', type: 'textarea' },
      ]}
      run={(v) => aiExitScenario(v)}
    />
  );
}
