import React from 'react';
import AIPage from '../components/AIPage';
import { aiExecutiveBrief } from '../services/api';

export default function AIExecutiveBriefPage() {
  return (
    <AIPage
      title="AI · Executive Brief"
      feature="executive-brief"
      subtitle="Monday-morning partner brief on pipeline + portfolio + fund actions."
      inputs={[
        { key: 'notes', label: 'Bias / Focus (optional)', type: 'textarea',
          placeholder: 'e.g. Focus on Fund IV deployment, at-risk portfolio companies, IC calendar.' },
      ]}
      run={(v) => aiExecutiveBrief({ notes: v.notes })}
    />
  );
}
