import React from 'react';
import CrudPage from '../components/CrudPage';
import { fundraisingPipelineApi } from '../services/api';

export default function FundraisingPipelinePage() {
  return (
    <CrudPage
      title="Fundraising Pipeline"
      subtitle="Fundraise opportunities by LP, stage, target commitment, probability and next step."
      api={fundraisingPipelineApi}
      statusKey="stage"
      fields={[
        { key: 'raise_id', label: 'Raise ID' },
        { key: 'fund_id', label: 'Fund ID' },
        { key: 'lp_name', label: 'LP Name' },
        { key: 'stage', label: 'Stage', type: 'select', options: ['targeted','first_meeting','diligence','legal','committed','passed'] },
        { key: 'target_commitment_usd', label: 'Target Commitment (USD)', type: 'number' },
        { key: 'probability_pct', label: 'Probability %', type: 'number' },
        { key: 'next_step', label: 'Next Step' },
        { key: 'next_touch_date', label: 'Next Touch', type: 'date' },
        { key: 'owner', label: 'Owner' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
