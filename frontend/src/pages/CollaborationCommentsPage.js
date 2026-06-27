import React from 'react';
import CrudPage from '../components/CrudPage';
import { collaborationCommentsApi } from '../services/api';

export default function CollaborationCommentsPage() {
  return (
    <CrudPage
      title="Collaboration Comments"
      subtitle="Internal comments, mentions and discussion notes attached to deals, documents, funds and tasks."
      api={collaborationCommentsApi}
      statusKey="status"
      fields={[
        { key: 'comment_id', label: 'Comment ID' },
        { key: 'resource_type', label: 'Resource Type', type: 'select', options: ['deal','company','fund','document','task','memo'] },
        { key: 'resource_id', label: 'Resource ID' },
        { key: 'author', label: 'Author' },
        { key: 'body', label: 'Comment', type: 'textarea' },
        { key: 'visibility', label: 'Visibility', type: 'select', options: ['internal','partners','deal_team'] },
        { key: 'status', label: 'Status', type: 'select', options: ['open','resolved'] },
      ]}
    />
  );
}
