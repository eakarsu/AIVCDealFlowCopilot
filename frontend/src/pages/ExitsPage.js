import React from 'react';
import CrudPage from '../components/CrudPage';
import { exitsApi } from '../services/api';

export default function ExitsPage() {
  return (
    <CrudPage
      title="Exits"
      subtitle="Realized exits across the firm."
      api={exitsApi}
      statusKey="type"
      fields={[
        { key: 'exit_id',    label: 'Exit ID' },
        { key: 'company_id', label: 'Company ID' },
        { key: 'type',       label: 'Type', type: 'select', options: ['acquisition','ipo','secondary','write_off'] },
        { key: 'value_usd',  label: 'Value (USD)',  type: 'number' },
        { key: 'multiple',   label: 'Multiple (x)', type: 'number' },
        { key: 'closed_at',  label: 'Closed At',    type: 'date' },
      ]}
    />
  );
}
