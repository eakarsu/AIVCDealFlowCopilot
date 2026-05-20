import React from 'react';
import PipelineKanban from '../components/PipelineKanban';
import PortfolioBubble from '../components/PortfolioBubble';
import FundTVPI from '../components/FundTVPI';
import SectorDonut from '../components/SectorDonut';

function Panel({ title, subtitle, children, style }) {
  return (
    <div
      className="card"
      style={{
        background: '#0b1220',
        border: '1px solid #1f2937',
        borderRadius: 10,
        padding: 20,
        marginBottom: 24,
        ...style,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: 16 }}>{title}</h3>
        {subtitle && (
          <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
}

export default function CustomViewsPage() {
  return (
    <div data-testid="custom-views-page">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h2>VC Analytics</h2>
        <p>Custom views: pipeline kanban, portfolio bubble map, fund TVPI trend, and sector mix.</p>
      </div>

      <Panel
        title="Pipeline Kanban"
        subtitle="Active deals grouped by stage."
      >
        <PipelineKanban />
      </Panel>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: 24,
        marginBottom: 0,
      }}>
        <Panel
          title="Portfolio Bubble Map"
          subtitle="X = last valuation · Y = ownership % · size = last round amount · color = sector."
          style={{ marginBottom: 0 }}
        >
          <PortfolioBubble />
        </Panel>

        <Panel
          title="Sector Mix"
          subtitle="Distribution of investments by sector."
          style={{ marginBottom: 0 }}
        >
          <SectorDonut />
        </Panel>
      </div>

      <Panel
        title="Fund TVPI Trend"
        subtitle="DPI, RVPI and TVPI over time across all funds."
        style={{ marginTop: 24 }}
      >
        <FundTVPI />
      </Panel>
    </div>
  );
}
