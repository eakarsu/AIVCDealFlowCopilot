import React from 'react';
import CrudPage from '../components/CrudPage';
import { capitalCallsApi } from '../services/api';

export default function CapitalCallsPage() {
  return (
    <CrudPage
      title="Capital Calls"
      subtitle="LP capital calls by fund and period."
      api={capitalCallsApi}
      statusKey="status"
      fields={[
        { key: 'call_id',    label: 'Call ID' },
        { key: 'fund_id',    label: 'Fund ID' },
        { key: 'period',     label: 'Period' },
        { key: 'amount_usd', label: 'Amount (USD)', type: 'number' },
        { key: 'status',     label: 'Status', type: 'select', options: ['issued','paid','late','cancelled'] },
        { key: 'due_date',   label: 'Due Date', type: 'date' },
      ]}
    />
  );
}
