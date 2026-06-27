import React from 'react';
import CrudPage from '../components/CrudPage';
import { diligenceTasksApi } from '../services/api';

export default function DiligenceTasksPage() {
  return (
    <CrudPage
      title="Diligence Tasks"
      subtitle="Owner-driven diligence checklist across commercial, technical, financial, legal and security workstreams."
      api={diligenceTasksApi}
      statusKey="status"
      fields={[
        { key: 'task_id', label: 'Task ID' },
        { key: 'deal_id', label: 'Deal ID' },
        { key: 'workstream', label: 'Workstream', type: 'select', options: ['commercial','technical','financial','legal','security','people'] },
        { key: 'title', label: 'Title' },
        { key: 'owner', label: 'Owner' },
        { key: 'priority', label: 'Priority', type: 'select', options: ['low','medium','high','urgent'] },
        { key: 'status', label: 'Status', type: 'select', options: ['open','in_progress','blocked','complete'] },
        { key: 'due_date', label: 'Due Date', type: 'date' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
