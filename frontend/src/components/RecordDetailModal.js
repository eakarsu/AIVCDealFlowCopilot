import React from 'react';

const titleCase = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

function formatValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (Array.isArray(value)) {
    if (value.every((item) => item == null || ['string', 'number', 'boolean'].includes(typeof item))) {
      return value.map(formatValue).join(', ');
    }
    return JSON.stringify(value, null, 2);
  }
  if (isPlainObject(value)) return JSON.stringify(value, null, 2);
  return String(value);
}

function pickTitle(record, fallback) {
  if (!record || typeof record !== 'object') return fallback || 'Details';
  const key = ['name', 'title', 'company_name', 'deal_name', 'fund_name', 'founder_name', 'entry_id', 'buyer', 'email', 'id']
    .find((candidate) => record[candidate] != null && record[candidate] !== '');
  return key ? String(record[key]) : (fallback || 'Details');
}

export default function RecordDetailModal({ record, title, actions = [], onClose, onEdit, onDelete }) {
  if (!record) return null;
  const entries = isPlainObject(record) ? Object.entries(record) : [['value', record]];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content record-detail-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{title || pickTitle(record)}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="record-detail-grid">
            {entries.map(([key, value]) => {
              const rendered = formatValue(value);
              const multiline = typeof rendered === 'string' && (rendered.length > 90 || rendered.includes('\n'));
              return (
                <div key={key} className={`record-detail-item ${multiline ? 'wide' : ''}`}>
                  <div className="record-detail-key">{titleCase(key)}</div>
                  <div className="record-detail-value">
                    {multiline ? <pre>{rendered}</pre> : rendered}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-footer">
          {actions.map((action) => (
            <button
              key={action.label}
              className={`btn ${action.variant || 'secondary'}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
          {onDelete && <button className="btn danger" onClick={onDelete}>Delete</button>}
          {onEdit && <button className="btn" onClick={onEdit}>Edit</button>}
          <button className="btn secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
