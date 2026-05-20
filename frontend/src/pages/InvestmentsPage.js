import React from 'react';
import CrudPage from '../components/CrudPage';
import { investmentsApi } from '../services/api';

export default function InvestmentsPage() {
  return (
    <CrudPage
      title="Investments"
      subtitle="Closed investments across all funds."
      api={investmentsApi}
      fields={[
        { key: 'inv_id',        label: 'Investment ID' },
        { key: 'deal_id',       label: 'Deal ID' },
        { key: 'fund_id',       label: 'Fund ID' },
        { key: 'amount_usd',    label: 'Amount (USD)',    type: 'number' },
        { key: 'valuation_usd', label: 'Valuation (USD)', type: 'number' },
        { key: 'closed_at',     label: 'Closed At',       type: 'date' },
        { key: 'notes',         label: 'Notes',           type: 'textarea' },
      ]}
    />
  );
}
