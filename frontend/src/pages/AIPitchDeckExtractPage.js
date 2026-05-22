import React from 'react';
import AIPage from '../components/AIPage';
import { aiPitchDeckExtract } from '../services/api';

export default function AIPitchDeckExtractPage() {
  return (
    <AIPage
      title="AI · Pitch Deck Extract"
      feature="pitch-deck-extract"
      subtitle="Paste deck text (already converted from PDF/PPTX) and extract structured fields."
      inputs={[
        { key: 'deck_text',     label: 'Deck Text', type: 'textarea',
          placeholder: 'Paste the full pitch deck transcript / OCR / export here…' },
        { key: 'context_notes', label: 'Context Notes (optional)', type: 'textarea' },
      ]}
      run={(v) => aiPitchDeckExtract(v)}
    />
  );
}
