import React, { useState } from 'react';
import RecordDetailModal from '../components/RecordDetailModal';
import { globalSearch } from '../services/api';

export default function GlobalSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const runSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await globalSearch(query);
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Global Search</h2>
          <p>Search deals, companies, founders, documents, diligence tasks, LP contacts, updates and comments.</p>
        </div>
      </div>

      <div className="card">
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <input
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') runSearch();
            }}
            placeholder="Search Halcyon, Fund IV, legal, ARR, IC, owner..."
          />
          <button className="btn ai" onClick={runSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && <div className="ai-error">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Type</th><th>ID</th><th>Title</th><th>Subtitle</th></tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr
                key={`${result.type}-${result.id}-${index}`}
                className="clickable-row"
                tabIndex={0}
                onClick={() => setSelected(result.row)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelected(result.row);
                  }
                }}
              >
                <td><span className="badge">{result.type}</span></td>
                <td>{result.id}</td>
                <td>{result.title}</td>
                <td>{result.subtitle || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && query && results.length === 0 && (
        <div className="empty-state">No matching records.</div>
      )}

      {selected && (
        <RecordDetailModal
          record={selected}
          title={selected.title || selected.name || selected.company_name || selected.id || 'Search Result Details'}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
