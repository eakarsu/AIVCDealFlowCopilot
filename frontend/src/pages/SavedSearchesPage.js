import React from 'react';
import CrudPage from '../components/CrudPage';
import { savedSearchesApi } from '../services/api';

export default function SavedSearchesPage() {
  return (
    <CrudPage
      title="Saved Searches"
      subtitle="Reusable searches and alert definitions across deals, documents, portfolio updates and LP workflows."
      api={savedSearchesApi}
      fields={[
        { key: 'search_id', label: 'Search ID' },
        { key: 'name', label: 'Name' },
        { key: 'scope', label: 'Scope', type: 'select', options: ['all','deals','documents','portfolio','lp','comments'] },
        { key: 'query', label: 'Query', type: 'textarea' },
        { key: 'owner', label: 'Owner' },
        { key: 'alert_enabled', label: 'Alert Enabled', type: 'select', options: ['true','false'] },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
