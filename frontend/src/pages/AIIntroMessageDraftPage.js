import React from 'react';
import AIPage from '../components/AIPage';
import { aiIntroMessageDraft } from '../services/api';

export default function AIIntroMessageDraftPage() {
  return (
    <AIPage
      title="AI · Intro Message Draft"
      feature="intro-message-draft"
      subtitle="Draft a warm-intro email from source to target with hooks."
      inputs={[
        { key: 'source',        label: 'Source (introducer)' },
        { key: 'target',        label: 'Target (founder / operator)' },
        { key: 'context_notes', label: 'Context / Why this intro', type: 'textarea' },
      ]}
      run={(v) => aiIntroMessageDraft(v)}
    />
  );
}
