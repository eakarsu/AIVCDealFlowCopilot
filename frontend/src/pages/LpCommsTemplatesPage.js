import React from 'react';
import CrudPage from '../components/CrudPage';
import { lpCommsTemplatesApi } from '../services/api';

export default function LpCommsTemplatesPage() {
  return (
    <CrudPage
      title="LP Comms Templates"
      subtitle="Reusable LP letter / notice templates. Use {{variable}} tokens for runtime substitution."
      api={lpCommsTemplatesApi}
      statusKey="status"
      fields={[
        { key: 'template_id', label: 'Template ID' },
        { key: 'name',        label: 'Name' },
        { key: 'category',    label: 'Category', type: 'select',
          options: ['quarterly','capital_call','distribution','annual','adhoc'] },
        { key: 'subject',     label: 'Subject Line' },
        { key: 'body',        label: 'Body (supports {{variables}})', type: 'textarea' },
        { key: 'variables',   label: 'Declared Variables (comma-separated)',
          type: 'textarea' },
        { key: 'fund_id',     label: 'Fund ID (optional scope)' },
        { key: 'status',      label: 'Status', type: 'select',
          options: ['active','draft','archived'] },
      ]}
    />
  );
}
