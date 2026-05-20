import React from 'react';
import AIPage from '../components/AIPage';
import { aiFounderCallSummary } from '../services/api';

export default function AIFounderCallSummaryPage() {
  return (
    <AIPage
      title="AI · Founder Call Summary"
      feature="founder-call-summary"
      subtitle="Distill founder call transcript / notes into actionable summary."
      inputs={[
        { key: 'transcript', label: 'Transcript / Notes', type: 'textarea',
          placeholder: 'Paste call notes here — CEO walked through demo, discussed traction, etc.' },
      ]}
      run={(v) => aiFounderCallSummary({ transcript: v.transcript })}
    />
  );
}
