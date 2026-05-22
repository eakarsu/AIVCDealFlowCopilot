import React from 'react';
import AIPage from '../components/AIPage';
import { aiFounderBackgroundSummary } from '../services/api';

export default function AIFounderBackgroundSummaryPage() {
  return (
    <AIPage
      title="AI · Founder Background Summary"
      feature="founder-background-summary"
      subtitle="Fund-grade founder bio synthesis from LinkedIn / press / interview material."
      inputs={[
        { key: 'founder_name',  label: 'Founder Name', placeholder: 'Aisha Rahman' },
        { key: 'material',      label: 'Source Material', type: 'textarea',
          placeholder: 'Paste LinkedIn export, press clippings, interview notes, conference bio…' },
        { key: 'context_notes', label: 'Diligence Context (optional)', type: 'textarea' },
      ]}
      run={(v) => aiFounderBackgroundSummary(v)}
    />
  );
}
