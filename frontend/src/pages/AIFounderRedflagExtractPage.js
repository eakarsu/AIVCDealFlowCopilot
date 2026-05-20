import React from 'react';
import AIPage from '../components/AIPage';
import { aiFounderRedflagExtract } from '../services/api';

export default function AIFounderRedflagExtractPage() {
  return (
    <AIPage
      title="AI · Founder Red-Flag Extract"
      feature="founder-redflag-extract"
      subtitle="Extract red and yellow flags from founder material (refs, press, cap table, etc.)."
      inputs={[
        { key: 'founder_name', label: 'Founder Name' },
        { key: 'material',     label: 'Source Material (references, press, board minutes, cap-table notes)', type: 'textarea' },
      ]}
      run={(v) => aiFounderRedflagExtract(v)}
    />
  );
}
