import React from 'react';
import CrudPage from '../components/CrudPage';
import { dataRoomDocumentsApi } from '../services/api';

export default function DataRoomDocumentsPage() {
  return (
    <CrudPage
      title="Data Room Documents"
      subtitle="Pitch decks, financials, legal files, security materials and diligence packets."
      api={dataRoomDocumentsApi}
      statusKey="status"
      fields={[
        { key: 'doc_id', label: 'Doc ID' },
        { key: 'deal_id', label: 'Deal ID' },
        { key: 'company_id', label: 'Company ID' },
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category', type: 'select', options: ['financials','legal','product','security','customer','technical','hr'] },
        { key: 'confidentiality', label: 'Confidentiality', type: 'select', options: ['internal','confidential','restricted'] },
        { key: 'owner', label: 'Owner' },
        { key: 'status', label: 'Status', type: 'select', options: ['indexed','review_needed','approved','archived'] },
        { key: 'uploaded_at', label: 'Uploaded At', type: 'datetime-local' },
        { key: 'summary', label: 'Summary', type: 'textarea' },
      ]}
    />
  );
}
