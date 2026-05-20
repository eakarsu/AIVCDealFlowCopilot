import React, { useEffect, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

function fmtUsd(n) {
  if (!n) return '$0';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div style={{
      background: '#0b1220',
      border: '1px solid #1f2937',
      padding: 10,
      borderRadius: 6,
      fontSize: 12,
      color: '#e2e8f0',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.company_name}</div>
      <div>Sector: <span style={{ color: '#cbd5e1' }}>{p.sector}</span></div>
      <div>Last Valuation: <span style={{ color: '#60a5fa' }}>{fmtUsd(p.last_valuation)}</span></div>
      <div>Ownership: <span style={{ color: '#34d399' }}>{Number(p.ownership_pct).toFixed(2)}%</span></div>
      <div>Last Round: <span style={{ color: '#fbbf24' }}>{fmtUsd(p.last_round_amt)}</span></div>
    </div>
  );
}

export default function PortfolioBubble() {
  const [data, setData] = useState({ points: [], sectors: [], palette: {} });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`${API_BASE}/custom-views/portfolio-bubble`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d?.error) setErr(d.error);
        else setData({
          points:   Array.isArray(d?.points)  ? d.points  : [],
          sectors:  Array.isArray(d?.sectors) ? d.sectors : [],
          palette:  d?.palette || {},
        });
      })
      .catch((e) => { if (alive) setErr(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ color: '#94a3b8' }}>Loading portfolio…</div>;
  if (err)     return <div style={{ color: '#fca5a5' }}>Error: {err}</div>;
  if (!data.points.length) return <div style={{ color: '#94a3b8' }}>No investments yet.</div>;

  // Group points by sector for distinct Scatter series (so legend & color-by-sector work).
  const bySector = {};
  for (const p of data.points) {
    if (!bySector[p.sector]) bySector[p.sector] = [];
    bySector[p.sector].push(p);
  }

  return (
    <div data-testid="portfolio-bubble" style={{ width: '100%', height: 480 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 60 }}>
          <CartesianGrid stroke="#1f2937" />
          <XAxis
            type="number"
            dataKey="last_valuation"
            name="Last Valuation"
            tickFormatter={fmtUsd}
            stroke="#94a3b8"
            label={{ value: 'Last Valuation (USD)', position: 'insideBottom', offset: -10, fill: '#cbd5e1' }}
          />
          <YAxis
            type="number"
            dataKey="ownership_pct"
            name="Ownership %"
            stroke="#94a3b8"
            label={{ value: 'Ownership %', angle: -90, position: 'insideLeft', fill: '#cbd5e1' }}
          />
          <ZAxis type="number" dataKey="last_round_amt" range={[60, 600]} name="Last Round" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: 8 }} />
          {Object.entries(bySector).map(([sector, points]) => (
            <Scatter
              key={sector}
              name={sector}
              data={points}
              fill={data.palette[sector] || '#3b82f6'}
              fillOpacity={0.75}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
