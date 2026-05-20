import React from 'react';
import CrudPage from '../components/CrudPage';
import { companiesApi } from '../services/api';

export default function CompaniesPage() {
  return (
    <CrudPage
      title="Companies"
      subtitle="Tracked, portfolio and passed companies."
      api={companiesApi}
      statusKey="status"
      fields={[
        { key: 'company_id', label: 'Company ID' },
        { key: 'name',       label: 'Name' },
        { key: 'sector',     label: 'Sector' },
        { key: 'country',    label: 'Country' },
        { key: 'hq',         label: 'HQ' },
        { key: 'status',     label: 'Status', type: 'select', options: ['tracked','portfolio','passed','exited','wound_down'] },
        { key: 'notes',      label: 'Notes',  type: 'textarea' },
      ]}
    />
  );
}
