import React from 'react';
import { NavLink } from 'react-router-dom';
import { logout, getStoredUser } from '../services/api';

const PIPELINE_LINKS = [
  { to: '/deals',            label: 'Deals' },
  { to: '/diligence-tasks',  label: 'Diligence Tasks' },
  { to: '/pipeline-notes',   label: 'Pipeline Notes' },
  { to: '/intros',           label: 'Intros' },
  { to: '/term-sheets',      label: 'Term Sheets' },
];

const NEW_FEATURE_LINKS = [
  { to: '/diligence-tasks',         label: 'Diligence Tasks' },
  { to: '/data-room-documents',     label: 'Data Room Documents' },
  { to: '/lp-contacts',             label: 'LP Contacts' },
  { to: '/fundraising-pipeline',    label: 'Fundraising Pipeline' },
  { to: '/portfolio-updates',       label: 'Portfolio Updates' },
  { to: '/reserve-plans',           label: 'Reserve Plans' },
  { to: '/fund-expenses',           label: 'Fund Expenses' },
  { to: '/access-rules',            label: 'Access Rules' },
  { to: '/saved-searches',          label: 'Saved Searches' },
  { to: '/global-search',           label: 'Global Search' },
  { to: '/collaboration-comments',  label: 'Comments' },
];

const DATA_ROOM_LINKS = [
  { to: '/data-room-documents', label: 'Data Room Documents' },
];

const COMPANIES_LINKS = [
  { to: '/companies',        label: 'Companies' },
  { to: '/founders',         label: 'Founders' },
];

const FUNDS_LINKS = [
  { to: '/funds',            label: 'Funds' },
];

const MEMOS_LINKS = [
  { to: '/ic-memos',         label: 'IC Memos' },
];

const PORTFOLIO_LINKS = [
  { to: '/investments',         label: 'Investments' },
  { to: '/follow-ons',          label: 'Follow-Ons' },
  { to: '/portfolio-metrics',   label: 'Portfolio Metrics' },
  { to: '/kpi-ingest-sources',  label: 'KPI Ingest Sources' },
  { to: '/kpi-ingest-records',  label: 'KPI Ingest Records' },
  { to: '/exits',               label: 'Exits' },
];

const LP_LINKS = [
  { to: '/lp-contacts',          label: 'LP Contacts' },
  { to: '/fundraising-pipeline', label: 'Fundraising Pipeline' },
  { to: '/lp-reports',          label: 'LP Reports' },
  { to: '/lp-comms-templates',  label: 'LP Comms Templates' },
  { to: '/capital-calls',       label: 'Capital Calls' },
  { to: '/distributions',       label: 'Distributions' },
];

const FUND_OPS_LINKS = [
  { to: '/portfolio-updates', label: 'Portfolio Updates' },
  { to: '/reserve-plans',     label: 'Reserve Plans' },
  { to: '/fund-expenses',     label: 'Fund Expenses' },
];

const CAP_TABLE_LINKS = [
  { to: '/cap-tables',          label: 'Cap Tables' },
];

const GOVERNANCE_LINKS = [
  { to: '/board-meetings',   label: 'Board Meetings' },
  { to: '/advisors',         label: 'Advisors' },
  { to: '/access-rules',     label: 'Access Rules' },
  { to: '/audit-log',        label: 'Audit Log' },
];

const AI_MEMO_LINKS = [
  { to: '/ai/ic-memo-draft',              label: 'AI · IC Memo Draft' },
  { to: '/ai/founder-call-summary',       label: 'AI · Founder Call Summary' },
  { to: '/ai/founder-background-summary', label: 'AI · Founder Background Summary' },
  { to: '/ai/intro-message-draft',        label: 'AI · Intro Message Draft' },
  { to: '/ai/founder-redflag-extract',    label: 'AI · Founder Red-Flag Extract' },
  { to: '/ai/pitch-deck-extract',         label: 'AI · Pitch Deck Extract' },
  { to: '/ai/dd-qa-generate',             label: 'AI · DD Q&A Generate' },
];

const AI_ANALYSIS_LINKS = [
  { to: '/ai/comp-analysis',         label: 'AI · Comp Analysis' },
  { to: '/ai/valuation-band',        label: 'AI · Valuation Band' },
  { to: '/ai/market-mapping',        label: 'AI · Market Mapping' },
  { to: '/ai/market-size-estimate',  label: 'AI · Market Size Estimate' },
  { to: '/ai/thesis-fit-score',      label: 'AI · Thesis-Fit Score' },
  { to: '/ai/portfolio-flag',        label: 'AI · Portfolio Flag' },
  { to: '/ai/follow-on-recommend',   label: 'AI · Follow-On Recommend' },
  { to: '/ai/term-sheet-compare',    label: 'AI · Term Sheet Compare' },
  { to: '/ai/cap-table-impact',      label: 'AI · Cap Table Impact' },
  { to: '/ai/exit-scenario',         label: 'AI · Exit Scenario' },
];

const AI_REPORTING_LINKS = [
  { to: '/ai/executive-brief',         label: 'AI · Executive Brief' },
  { to: '/ai/lp-report-draft',         label: 'AI · LP Report Draft' },
  { to: '/ai/distribution-waterfall',  label: 'AI · Distribution Waterfall' },
  { to: '/ai/fund-strategy-brief',     label: 'AI · Fund Strategy Brief' },
];

export default function Sidebar() {
  const user = getStoredUser();
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h1>VC DEAL FLOW</h1>
        <p>Pipeline · IC · LP Reporting</p>
      </div>

      <NavLink to="/" end>Overview</NavLink>

      <div className="sidebar-group-label">New Features</div>
      {NEW_FEATURE_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Pipeline</div>
      {PIPELINE_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Data Room</div>
      {DATA_ROOM_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Companies</div>
      {COMPANIES_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Funds</div>
      {FUNDS_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Cap Tables</div>
      {CAP_TABLE_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Memos</div>
      {MEMOS_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Portfolio</div>
      {PORTFOLIO_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Fund Ops</div>
      {FUND_OPS_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">LP Reporting</div>
      {LP_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Governance</div>
      {GOVERNANCE_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">AI Memo</div>
      {AI_MEMO_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">AI Analysis</div>
      {AI_ANALYSIS_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">AI Reporting</div>
      {AI_REPORTING_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Analytics</div>
      <NavLink to="/custom-views">VC Analytics</NavLink>
      <NavLink to="/global-search">Global Search</NavLink>
      <NavLink to="/saved-searches">Saved Searches</NavLink>

      <div className="sidebar-group-label">Collaboration</div>
      <NavLink to="/collaboration-comments">Comments</NavLink>

      <div className="sidebar-group-label">Admin</div>
      <NavLink to="/webhooks">Webhooks</NavLink>

      <div className="sidebar-user">
        {user && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name || user.email}</div>
            <div className="sidebar-user-role">{user.role || 'user'}</div>
          </div>
        )}
        <button className="btn secondary sidebar-logout" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}
