import React from 'react';
import CrudPage from '../components/CrudPage';
import { fundExpensesApi } from '../services/api';

export default function FundExpensesPage() {
  return (
    <CrudPage
      title="Fund Expenses"
      subtitle="Fund-level operating expenses, vendor bills, approvals and allocation notes."
      api={fundExpensesApi}
      statusKey="approval_status"
      fields={[
        { key: 'expense_id', label: 'Expense ID' },
        { key: 'fund_id', label: 'Fund ID' },
        { key: 'category', label: 'Category', type: 'select', options: ['legal','audit','tax','data','travel','admin','insurance'] },
        { key: 'vendor', label: 'Vendor' },
        { key: 'amount_usd', label: 'Amount (USD)', type: 'number' },
        { key: 'period', label: 'Period' },
        { key: 'approval_status', label: 'Approval', type: 'select', options: ['pending','approved','rejected','paid'] },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
