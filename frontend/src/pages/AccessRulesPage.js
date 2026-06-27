import React from 'react';
import CrudPage from '../components/CrudPage';
import { accessRulesApi } from '../services/api';

export default function AccessRulesPage() {
  return (
    <CrudPage
      title="Access Rules"
      subtitle="Per-user, role or team permissions for sensitive deals, funds, documents and companies."
      api={accessRulesApi}
      statusKey="status"
      fields={[
        { key: 'rule_id', label: 'Rule ID' },
        { key: 'subject_type', label: 'Subject Type', type: 'select', options: ['role','user','team'] },
        { key: 'subject', label: 'Subject' },
        { key: 'resource_type', label: 'Resource Type', type: 'select', options: ['deal','document','fund','company','memo'] },
        { key: 'resource_id', label: 'Resource ID' },
        { key: 'permission', label: 'Permission', type: 'select', options: ['read','write','admin'] },
        { key: 'status', label: 'Status', type: 'select', options: ['active','paused','expired'] },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
