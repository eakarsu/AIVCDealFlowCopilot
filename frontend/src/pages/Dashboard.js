import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';

const FEATURES = [
  { path: '/deals',             title: 'Deals',             icon: 'D', color: '#3b82f6', desc: 'Pipeline from sourced through closed.' },
  { path: '/pipeline-notes',    title: 'Pipeline Notes',    icon: 'N', color: '#06b6d4', desc: 'Partner notes and sentiment by deal.' },
  { path: '/intros',            title: 'Intros',            icon: 'I', color: '#10b981', desc: 'Warm intros — inbound and outbound.' },
  { path: '/term-sheets',       title: 'Term Sheets',       icon: 'T', color: '#f59e0b', desc: 'Versioned term sheets per deal.' },
  { path: '/companies',         title: 'Companies',         icon: 'C', color: '#a78bfa', desc: 'Tracked, portfolio and passed companies.' },
  { path: '/founders',          title: 'Founders',          icon: 'F', color: '#ec4899', desc: 'Founder roster across pipeline and portfolio.' },
  { path: '/funds',             title: 'Funds',             icon: 'V', color: '#22c55e', desc: 'Active, harvesting and wound-down funds.' },
  { path: '/lp-reports',        title: 'LP Reports',        icon: 'L', color: '#0ea5e9', desc: 'Quarterly LP reports per fund.' },
  { path: '/capital-calls',     title: 'Capital Calls',     icon: '$', color: '#fb7185', desc: 'LP capital calls by fund and period.' },
  { path: '/distributions',     title: 'Distributions',     icon: 'X', color: '#facc15', desc: 'LP distributions, cash and in-kind.' },
  { path: '/ic-memos',          title: 'IC Memos',          icon: 'M', color: '#14b8a6', desc: 'Investment committee memos.' },
  { path: '/investments',       title: 'Investments',       icon: 'P', color: '#a3e635', desc: 'Closed investments across all funds.' },
  { path: '/follow-ons',        title: 'Follow-Ons',        icon: '+', color: '#60a5fa', desc: 'Follow-on commitments and decisions.' },
  { path: '/portfolio-metrics', title: 'Portfolio Metrics', icon: 'K', color: '#7dd3fc', desc: 'KPI values from portfolio companies.' },
  { path: '/board-meetings',    title: 'Board Meetings',    icon: 'B', color: '#f472b6', desc: 'Portfolio company board meetings.' },
  { path: '/advisors',          title: 'Advisors',          icon: 'A', color: '#dc2626', desc: 'Fund and portfolio advisors.' },
  { path: '/exits',             title: 'Exits',             icon: 'E', color: '#34d399', desc: 'Realized exits across the firm.' },
  { path: '/audit-log',         title: 'Audit Log',         icon: '#', color: '#ef4444', desc: 'System and user activity log.' },

  { path: '/ai/ic-memo-draft',           title: 'AI · IC Memo Draft',            icon: '*', color: '#8b5cf6', desc: 'Draft full IC memo from deal context.' },
  { path: '/ai/founder-call-summary',    title: 'AI · Founder Call Summary',     icon: '*', color: '#8b5cf6', desc: 'Summarize founder call notes.' },
  { path: '/ai/comp-analysis',           title: 'AI · Comp Analysis',            icon: '*', color: '#8b5cf6', desc: 'Build comp set + valuation band.' },
  { path: '/ai/valuation-band',          title: 'AI · Valuation Band',           icon: '*', color: '#8b5cf6', desc: 'Multi-method valuation band.' },
  { path: '/ai/executive-brief',         title: 'AI · Executive Brief',          icon: '*', color: '#8b5cf6', desc: 'Monday-morning partner brief.' },
  { path: '/ai/lp-report-draft',         title: 'AI · LP Report Draft',          icon: '*', color: '#8b5cf6', desc: 'Draft quarterly LP report.' },
  { path: '/ai/exit-scenario',           title: 'AI · Exit Scenario',            icon: '*', color: '#8b5cf6', desc: 'Probability-weighted exit modeling.' },
  { path: '/ai/portfolio-flag',          title: 'AI · Portfolio Flag',           icon: '*', color: '#8b5cf6', desc: 'Early-warning flags on KPIs.' },
  { path: '/ai/follow-on-recommend',     title: 'AI · Follow-On Recommend',      icon: '*', color: '#8b5cf6', desc: 'Pro-rata / super-pro-rata / trim.' },
  { path: '/ai/term-sheet-compare',      title: 'AI · Term Sheet Compare',       icon: '*', color: '#8b5cf6', desc: 'Compare versions, surface deltas.' },
  { path: '/ai/intro-message-draft',     title: 'AI · Intro Message Draft',      icon: '*', color: '#8b5cf6', desc: 'Warm-intro email with hooks.' },
  { path: '/ai/market-mapping',          title: 'AI · Market Mapping',           icon: '*', color: '#8b5cf6', desc: 'Sector map with whitespace.' },
  { path: '/ai/founder-redflag-extract', title: 'AI · Founder Red-Flag Extract', icon: '*', color: '#8b5cf6', desc: 'Extract flags from founder material.' },
  { path: '/ai/cap-table-impact',        title: 'AI · Cap Table Impact',         icon: '*', color: '#8b5cf6', desc: 'Model dilution from a round.' },
  { path: '/ai/distribution-waterfall',  title: 'AI · Distribution Waterfall',   icon: '*', color: '#8b5cf6', desc: 'LP/GP waterfall tiers for an exit.' },
  { path: '/ai/fund-strategy-brief',     title: 'AI · Fund Strategy Brief',      icon: '*', color: '#8b5cf6', desc: 'Deployment, concentration, reserves.' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch((e) => setErr(e.message));
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h2>Firm Overview</h2>
        <p>Pipeline · portfolio · funds · LP reporting · {new Date().toUTCString()}</p>
      </div>

      {err && <div className="ai-error">Stats unavailable: {err}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat"><div className="stat-label">Deals</div><div className="stat-value">{stats.deals?.total ?? '—'}</div><div className="stat-sub">{stats.deals?.diligence ?? 0} in diligence · {stats.deals?.closed ?? 0} closed</div></div>
          <div className="stat"><div className="stat-label">Founders</div><div className="stat-value">{stats.founders?.total ?? '—'}</div><div className="stat-sub">{stats.founders?.active ?? 0} active</div></div>
          <div className="stat"><div className="stat-label">Companies</div><div className="stat-value">{stats.companies?.total ?? '—'}</div><div className="stat-sub">{stats.companies?.portfolio ?? 0} portfolio</div></div>
          <div className="stat"><div className="stat-label">Funds</div><div className="stat-value">{stats.funds?.total ?? '—'}</div><div className="stat-sub">{stats.funds?.investing ?? 0} investing</div></div>
          <div className="stat"><div className="stat-label">LP Reports</div><div className="stat-value">{stats.lp_reports?.total ?? '—'}</div><div className="stat-sub">{stats.lp_reports?.distributed ?? 0} distributed</div></div>
          <div className="stat"><div className="stat-label">IC Memos</div><div className="stat-value">{stats.ic_memos?.total ?? '—'}</div><div className="stat-sub">{stats.ic_memos?.in_review ?? 0} in review · {stats.ic_memos?.approved ?? 0} approved</div></div>
          <div className="stat"><div className="stat-label">Investments</div><div className="stat-value">{stats.investments?.total ?? '—'}</div><div className="stat-sub">${Number(stats.investments?.total_amount || 0).toLocaleString()}</div></div>
          <div className="stat"><div className="stat-label">Follow-Ons</div><div className="stat-value">{stats.follow_ons?.total ?? '—'}</div><div className="stat-sub">{stats.follow_ons?.considering ?? 0} considering</div></div>
          <div className="stat"><div className="stat-label">KPI Metrics</div><div className="stat-value">{stats.portfolio_metrics?.total ?? '—'}</div><div className="stat-sub">datapoints</div></div>
          <div className="stat"><div className="stat-label">Board Meetings</div><div className="stat-value">{stats.board_meetings?.total ?? '—'}</div><div className="stat-sub">logged</div></div>
          <div className="stat"><div className="stat-label">Term Sheets</div><div className="stat-value">{stats.term_sheets?.total ?? '—'}</div><div className="stat-sub">{stats.term_sheets?.signed ?? 0} signed · {stats.term_sheets?.sent ?? 0} sent</div></div>
          <div className="stat"><div className="stat-label">Capital Calls</div><div className="stat-value">{stats.capital_calls?.total ?? '—'}</div><div className="stat-sub">{stats.capital_calls?.issued ?? 0} issued · {stats.capital_calls?.late ?? 0} late</div></div>
          <div className="stat"><div className="stat-label">Distributions</div><div className="stat-value">{stats.distributions?.total ?? '—'}</div><div className="stat-sub">${Number(stats.distributions?.total_amount || 0).toLocaleString()}</div></div>
          <div className="stat"><div className="stat-label">Advisors</div><div className="stat-value">{stats.advisors?.total ?? '—'}</div><div className="stat-sub">{stats.advisors?.active ?? 0} active</div></div>
          <div className="stat"><div className="stat-label">Intros</div><div className="stat-value">{stats.intros?.total ?? '—'}</div><div className="stat-sub">{stats.intros?.pending ?? 0} pending · {stats.intros?.completed ?? 0} completed</div></div>
          <div className="stat"><div className="stat-label">Pipeline Notes</div><div className="stat-value">{stats.pipeline_notes?.total ?? '—'}</div><div className="stat-sub">{stats.pipeline_notes?.positive ?? 0} pos · {stats.pipeline_notes?.negative ?? 0} neg</div></div>
          <div className="stat"><div className="stat-label">Exits</div><div className="stat-value">{stats.exits?.total ?? '—'}</div><div className="stat-sub">${Number(stats.exits?.total_value || 0).toLocaleString()}</div></div>
          <div className="stat"><div className="stat-label">Audit Log</div><div className="stat-value">{stats.audit_log?.total ?? '—'}</div><div className="stat-sub">entries</div></div>
        </div>
      )}

      <h3 style={{ color: '#cbd5e1', margin: '8px 0 14px', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Capabilities</h3>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div
            key={f.path}
            className="feature-card"
            style={{ ['--card-color']: f.color }}
            onClick={() => navigate(f.path)}
          >
            <div className="feature-card-icon" style={{ background: f.color + '22', color: f.color }}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
