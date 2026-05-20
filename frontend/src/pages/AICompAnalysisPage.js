import React from 'react';
import AIPage from '../components/AIPage';
import { aiCompAnalysis } from '../services/api';

export default function AICompAnalysisPage() {
  return (
    <AIPage
      title="AI · Comp Analysis"
      feature="comp-analysis"
      subtitle="Build a public + private comp set and implied valuation band."
      inputs={[
        { key: 'company_name', label: 'Subject Company' },
        { key: 'peers_text',   label: 'Peer Hints (comma- or newline-separated)', type: 'textarea' },
      ]}
      run={(v) => aiCompAnalysis(v)}
    />
  );
}
