import React from 'react';
import CrudPage from '../components/CrudPage';
import { followOnsApi } from '../services/api';

export default function FollowOnsPage() {
  return (
    <CrudPage
      title="Follow-Ons"
      subtitle="Follow-on commitments by underlying investment."
      api={followOnsApi}
      statusKey="status"
      fields={[
        { key: 'fo_id',         label: 'Follow-On ID' },
        { key: 'inv_id',        label: 'Investment ID' },
        { key: 'round',         label: 'Round', type: 'select', options: ['series_a','series_b','series_c','series_d','growth','bridge'] },
        { key: 'amount_usd',    label: 'Amount (USD)',  type: 'number' },
        { key: 'ownership_pct', label: 'Ownership (%)', type: 'number' },
        { key: 'status',        label: 'Status', type: 'select', options: ['considering','approved','declined'] },
        { key: 'notes',         label: 'Notes',  type: 'textarea' },
      ]}
    />
  );
}
