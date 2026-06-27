import React, { useEffect, useState } from 'react';
import { API_BASE, getToken } from '../services/api';
import RecordDetailModal from './RecordDetailModal';

const STAGE_LABELS = {
  pre_seed: 'Pre-Seed',
  seed:     'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  series_c: 'Series C',
  unknown:  'Unknown',
};

const STAGE_ACCENT = {
  pre_seed: '#a78bfa',
  seed:     '#22c55e',
  series_a: '#3b82f6',
  series_b: '#f59e0b',
  series_c: '#ec4899',
  unknown:  '#64748b',
};

function fmtUsd(n) {
  if (!n) return '$0';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

export default function PipelineKanban() {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`${API_BASE}/custom-views/pipeline-kanban`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d?.error) setErr(d.error);
        else setColumns(Array.isArray(d?.columns) ? d.columns : []);
      })
      .catch((e) => { if (alive) setErr(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ color: '#94a3b8' }}>Loading pipeline…</div>;
  if (err)     return <div style={{ color: '#fca5a5' }}>Error: {err}</div>;
  if (!columns.length) return <div style={{ color: '#94a3b8' }}>No deals yet.</div>;

  return (
    <div data-testid="pipeline-kanban" style={{
      display: 'flex',
      flexDirection: 'row',
      gap: 16,
      overflowX: 'auto',
      paddingBottom: 8,
      alignItems: 'flex-start',
    }}>
      {columns.map((col) => {
        const accent = STAGE_ACCENT[col.stage] || '#64748b';
        return (
          <div
            key={col.stage}
            style={{
              flex: '0 0 280px',
              background: '#0f172a',
              borderRadius: 8,
              padding: 12,
              border: '1px solid #1e293b',
              borderTop: `3px solid ${accent}`,
              minHeight: 120,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}>
              <div style={{
                color: '#f1f5f9',
                fontWeight: 600,
                fontSize: 13,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                {STAGE_LABELS[col.stage] || col.stage}
              </div>
              <div style={{
                background: accent,
                color: '#0b1220',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 10,
              }}>{col.count}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.deals.map((deal) => (
                <div
                  key={deal.deal_id}
                  className="clickable-card"
                  tabIndex={0}
                  onClick={() => setSelectedDeal(deal)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedDeal(deal);
                    }
                  }}
                  style={{
                    background: '#111827',
                    border: '1px solid #1f2937',
                    borderRadius: 6,
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                    {deal.company_name}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
                    {deal.deal_id} · {deal.sector || '—'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      background: '#1e293b',
                      color: '#cbd5e1',
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      letterSpacing: 0.4,
                    }}>{deal.status || '—'}</span>
                    <span style={{ color: '#60a5fa', fontSize: 12, fontWeight: 600 }}>
                      {fmtUsd(deal.round_size_usd)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {selectedDeal && (
        <RecordDetailModal
          record={selectedDeal}
          title={selectedDeal.company_name || selectedDeal.deal_id || 'Deal Details'}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
