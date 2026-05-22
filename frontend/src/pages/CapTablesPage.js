import React from 'react';
import CrudPage from '../components/CrudPage';
import { capTablesApi } from '../services/api';

export default function CapTablesPage() {
  return (
    <CrudPage
      title="Cap Tables"
      subtitle="Stakeholder line items per company — share classes, SAFEs, notes, option pool."
      api={capTablesApi}
      statusKey="status"
      fields={[
        { key: 'entry_id',          label: 'Entry ID' },
        { key: 'company_id',        label: 'Company ID' },
        { key: 'stakeholder',       label: 'Stakeholder' },
        { key: 'class',             label: 'Class', type: 'select',
          options: ['common','preferred_seed','preferred_a','preferred_b','preferred_c','safe','note','option_pool','warrant'] },
        { key: 'shares',            label: 'Shares', type: 'number' },
        { key: 'pct_ownership',     label: 'Ownership %', type: 'number' },
        { key: 'invested_usd',      label: 'Invested (USD)', type: 'number' },
        { key: 'valuation_cap_usd', label: 'Valuation Cap (USD, SAFE/Note)', type: 'number' },
        { key: 'discount_pct',      label: 'Discount % (SAFE/Note)', type: 'number' },
        { key: 'issued_at',         label: 'Issued At', type: 'date' },
        { key: 'status',            label: 'Status', type: 'select',
          options: ['active','converted','cancelled','exited'] },
        { key: 'notes',             label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
