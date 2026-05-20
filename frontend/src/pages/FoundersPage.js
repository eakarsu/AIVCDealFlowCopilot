import React from 'react';
import CrudPage from '../components/CrudPage';
import { foundersApi } from '../services/api';

export default function FoundersPage() {
  return (
    <CrudPage
      title="Founders"
      subtitle="Founder roster across pipeline and portfolio."
      api={foundersApi}
      statusKey="status"
      fields={[
        { key: 'founder_id', label: 'Founder ID' },
        { key: 'name',       label: 'Name' },
        { key: 'company_id', label: 'Company ID' },
        { key: 'role',       label: 'Role' },
        { key: 'linkedin',   label: 'LinkedIn' },
        { key: 'status',     label: 'Status', type: 'select', options: ['active','departed','contacted','passed'] },
        { key: 'notes',      label: 'Notes',  type: 'textarea' },
      ]}
    />
  );
}
