import React from 'react';
import AIPage from '../components/AIPage';
import { aiTermSheetCompare } from '../services/api';

export default function AITermSheetComparePage() {
  return (
    <AIPage
      title="AI · Term Sheet Compare"
      feature="term-sheet-compare"
      subtitle="Compare two or more term-sheet versions and surface negotiation deltas."
      inputs={[
        { key: 'versions_text', label: 'Term Sheet Versions (paste each version)', type: 'textarea',
          placeholder: 'V1: ... terms\n\nV2: ... terms' },
      ]}
      run={(v) => aiTermSheetCompare({ versions_text: v.versions_text })}
    />
  );
}
