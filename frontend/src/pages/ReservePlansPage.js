import React from 'react';
import CrudPage from '../components/CrudPage';
import { reservePlansApi } from '../services/api';

export default function ReservePlansPage() {
  return (
    <CrudPage
      title="Reserve Plans"
      subtitle="Fund construction and follow-on reserve scenarios by fund and portfolio company."
      api={reservePlansApi}
      statusKey="recommendation"
      fields={[
        { key: 'plan_id', label: 'Plan ID' },
        { key: 'fund_id', label: 'Fund ID' },
        { key: 'company_id', label: 'Company ID' },
        { key: 'current_ownership_pct', label: 'Ownership %', type: 'number' },
        { key: 'reserve_amount_usd', label: 'Reserve Amount (USD)', type: 'number' },
        { key: 'scenario', label: 'Scenario', type: 'select', options: ['base','upside','downside'] },
        { key: 'recommendation', label: 'Recommendation', type: 'select', options: ['reserve','super_pro_rata','hold','trim'] },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
