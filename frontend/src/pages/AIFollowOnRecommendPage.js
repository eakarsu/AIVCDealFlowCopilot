import React from 'react';
import AIPage from '../components/AIPage';
import { aiFollowOnRecommend } from '../services/api';

export default function AIFollowOnRecommendPage() {
  return (
    <AIPage
      title="AI · Follow-On Recommend"
      feature="follow-on-recommend"
      subtitle="Recommend pro-rata, super-pro-rata, hold or trim on a follow-on opportunity."
      inputs={[
        { key: 'investment_id', label: 'Investment ID', placeholder: 'INV-2024-002' },
        { key: 'notes',         label: 'Round Context', type: 'textarea' },
      ]}
      run={(v) => aiFollowOnRecommend(v)}
    />
  );
}
