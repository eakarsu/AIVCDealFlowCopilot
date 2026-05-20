import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
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
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.sector}</div>
      <div>Investments: <span style={{ color: '#60a5fa' }}>{p.count}</span></div>
      <div>Total Invested: <span style={{ color: '#34d399' }}>{fmtUsd(p.total_amount)}</span></div>
    </div>
  );
}

export default function SectorDonut() {
  const [slices, setSlices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`${API_BASE}/custom-views/sector-donut`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d?.error) { setErr(d.error); return; }
        setSlices(Array.isArray(d?.slices) ? d.slices : []);
        setTotal(Number(d?.total) || 0);
      })
      .catch((e) => { if (alive) setErr(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ color: '#94a3b8' }}>Loading sectors…</div>;
  if (err)     return <div style={{ color: '#fca5a5' }}>Error: {err}</div>;
  if (!slices.length) return <div style={{ color: '#94a3b8' }}>No investments yet.</div>;

  return (
    <div data-testid="sector-donut" style={{ width: '100%', height: 380, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="count"
            nameKey="sector"
            innerRadius={70}
            outerRadius={130}
            paddingAngle={2}
            stroke="#0f172a"
          >
            {slices.map((s, i) => (
              <Cell key={`c-${i}`} fill={s.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ color: '#cbd5e1', paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute',
        top: '38%',
        left: 0, right: 0,
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
          Investments
        </div>
        <div style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 700 }}>{total}</div>
      </div>
    </div>
  );
}
