import React from 'react';
import CrudPage from '../components/CrudPage';
import { advisorsApi } from '../services/api';

export default function AdvisorsPage() {
  return (
    <CrudPage
      title="Advisors"
      subtitle="Fund and portfolio advisors."
      api={advisorsApi}
      statusKey="status"
      fields={[
        { key: 'advisor_id', label: 'Advisor ID' },
        { key: 'name',       label: 'Name' },
        { key: 'firm',       label: 'Firm' },
        { key: 'expertise',  label: 'Expertise' },
        { key: 'fund_id',    label: 'Fund ID' },
        { key: 'status',     label: 'Status', type: 'select', options: ['active','inactive','prospective'] },
      ]}
    />
  );
}
