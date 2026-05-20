import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

export default function FundTVPI({ fundId = '' }) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const qs = fundId ? `?fund_id=${encodeURIComponent(fundId)}` : '';
    fetch(`${API_BASE}/custom-views/fund-tvpi-trend${qs}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d?.error) setErr(d.error);
        else setSeries(Array.isArray(d?.series) ? d.series : []);
      })
      .catch((e) => { if (alive) setErr(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [fundId]);

  if (loading) return <div style={{ color: '#94a3b8' }}>Loading fund metrics…</div>;
  if (err)     return <div style={{ color: '#fca5a5' }}>Error: {err}</div>;
  if (!series.length) return <div style={{ color: '#94a3b8' }}>No LP reports yet.</div>;

  return (
    <div data-testid="fund-tvpi" style={{ width: '100%', height: 360 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
          <XAxis dataKey="period" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ background: '#0b1220', border: '1px solid #1f2937', color: '#e2e8f0' }}
            labelStyle={{ color: '#cbd5e1', fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: 8 }} />
          <Line type="monotone" dataKey="dpi"  stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="DPI"  />
          <Line type="monotone" dataKey="rvpi" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="RVPI" />
          <Line type="monotone" dataKey="tvpi" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="TVPI" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
