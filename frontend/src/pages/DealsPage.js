import React from 'react';
import CrudPage from '../components/CrudPage';
import { dealsApi } from '../services/api';

export default function DealsPage() {
  return (
    <CrudPage
      title="Deals"
      subtitle="Pipeline of sourced, diligence, term-sheet and closed deals."
      api={dealsApi}
      statusKey="status"
      fields={[
        { key: 'deal_id',        label: 'Deal ID' },
        { key: 'company_name',   label: 'Company' },
        { key: 'stage',          label: 'Stage',  type: 'select', options: ['pre_seed','seed','series_a','series_b','series_c','series_d','growth'] },
        { key: 'sector',         label: 'Sector' },
        { key: 'round_size_usd', label: 'Round Size (USD)', type: 'number' },
        { key: 'status',         label: 'Status', type: 'select', options: ['sourced','diligence','ic_review','term_sheet','closed','passed'] },
        { key: 'notes',          label: 'Notes',  type: 'textarea' },
      ]}
    />
  );
}
