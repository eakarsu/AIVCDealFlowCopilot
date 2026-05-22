import React from 'react';
import AIPage from '../components/AIPage';
import { aiDdQaGenerate } from '../services/api';

export default function AIDdQaGeneratePage() {
  return (
    <AIPage
      title="AI · DD Q&A Generate"
      feature="dd-qa-generate"
      subtitle="Generate a sector- and stage-tailored due-diligence question set + data-room checklist."
      inputs={[
        { key: 'sector', label: 'Sector', placeholder: 'enterprise AI, climate hardware, cardiometabolic biotech…' },
        { key: 'stage',  label: 'Stage',  type: 'select',
          options: ['pre_seed','seed','series_a','series_b','series_c','series_d','growth'] },
        { key: 'focus_notes', label: 'Focus Areas / Concerns', type: 'textarea' },
      ]}
      run={(v) => aiDdQaGenerate(v)}
    />
  );
}
