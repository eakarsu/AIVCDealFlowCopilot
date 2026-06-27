import React from 'react';
import CrudPage from '../components/CrudPage';
import { lpContactsApi } from '../services/api';

export default function LpContactsPage() {
  return (
    <CrudPage
      title="LP Contacts"
      subtitle="LP relationship CRM for fundraising, reporting and ongoing investor coverage."
      api={lpContactsApi}
      statusKey="status"
      fields={[
        { key: 'contact_id', label: 'Contact ID' },
        { key: 'lp_name', label: 'LP Name' },
        { key: 'contact_name', label: 'Contact' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'geography', label: 'Geography' },
        { key: 'commitment_usd', label: 'Commitment (USD)', type: 'number' },
        { key: 'status', label: 'Status', type: 'select', options: ['active','prospect','watchlist','inactive'] },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
