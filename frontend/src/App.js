import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';

// 18 VC CRUD pages
import DealsPage from './pages/DealsPage';
import FoundersPage from './pages/FoundersPage';
import CompaniesPage from './pages/CompaniesPage';
import FundsPage from './pages/FundsPage';
import LpReportsPage from './pages/LpReportsPage';
import IcMemosPage from './pages/IcMemosPage';
import InvestmentsPage from './pages/InvestmentsPage';
import FollowOnsPage from './pages/FollowOnsPage';
import PortfolioMetricsPage from './pages/PortfolioMetricsPage';
import BoardMeetingsPage from './pages/BoardMeetingsPage';
import TermSheetsPage from './pages/TermSheetsPage';
import CapitalCallsPage from './pages/CapitalCallsPage';
import DistributionsPage from './pages/DistributionsPage';
import AdvisorsPage from './pages/AdvisorsPage';
import IntrosPage from './pages/IntrosPage';
import PipelineNotesPage from './pages/PipelineNotesPage';
import ExitsPage from './pages/ExitsPage';
import AuditLogPage from './pages/AuditLogPage';

// 16 AI pages
import AIIcMemoDraftPage from './pages/AIIcMemoDraftPage';
import AIFounderCallSummaryPage from './pages/AIFounderCallSummaryPage';
import AICompAnalysisPage from './pages/AICompAnalysisPage';
import AIValuationBandPage from './pages/AIValuationBandPage';
import AIExecutiveBriefPage from './pages/AIExecutiveBriefPage';
import AILpReportDraftPage from './pages/AILpReportDraftPage';
import AIExitScenarioPage from './pages/AIExitScenarioPage';
import AIPortfolioFlagPage from './pages/AIPortfolioFlagPage';
import AIFollowOnRecommendPage from './pages/AIFollowOnRecommendPage';
import AITermSheetComparePage from './pages/AITermSheetComparePage';
import AIIntroMessageDraftPage from './pages/AIIntroMessageDraftPage';
import AIMarketMappingPage from './pages/AIMarketMappingPage';
import AIFounderRedflagExtractPage from './pages/AIFounderRedflagExtractPage';
import AICapTableImpactPage from './pages/AICapTableImpactPage';
import AIDistributionWaterfallPage from './pages/AIDistributionWaterfallPage';
import AIFundStrategyBriefPage from './pages/AIFundStrategyBriefPage';

// Apply pass 7 — backlog AI verb pages
import AIPitchDeckExtractPage from './pages/AIPitchDeckExtractPage';
import AIDdQaGeneratePage from './pages/AIDdQaGeneratePage';
import AIMarketSizeEstimatePage from './pages/AIMarketSizeEstimatePage';
import AIFounderBackgroundSummaryPage from './pages/AIFounderBackgroundSummaryPage';
import AIThesisFitScorePage from './pages/AIThesisFitScorePage';

// Apply pass 7 — backlog CRUD pages
import CapTablesPage from './pages/CapTablesPage';
import LpCommsTemplatesPage from './pages/LpCommsTemplatesPage';
import KpiIngestSourcesPage from './pages/KpiIngestSourcesPage';
import KpiIngestRecordsPage from './pages/KpiIngestRecordsPage';

// Admin
import WebhooksPage from './pages/WebhooksPage';

// Custom analytics views
import CustomViewsPage from './pages/CustomViewsPage';

import LoginPage from './pages/LoginPage';
import { getToken } from './services/api';

import './App.css';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

function RequireAuth({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function ShellRoutes() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main" style={{ padding: 0 }}>
        <Topbar />
        <div style={{ padding: '24px 32px' }}>
          <Routes>
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

            <Route path="/" element={<Dashboard />} />

            <Route path="/deals"              element={<DealsPage />} />
            <Route path="/founders"           element={<FoundersPage />} />
            <Route path="/companies"          element={<CompaniesPage />} />
            <Route path="/funds"              element={<FundsPage />} />
            <Route path="/lp-reports"         element={<LpReportsPage />} />
            <Route path="/ic-memos"           element={<IcMemosPage />} />
            <Route path="/investments"        element={<InvestmentsPage />} />
            <Route path="/follow-ons"         element={<FollowOnsPage />} />
            <Route path="/portfolio-metrics"  element={<PortfolioMetricsPage />} />
            <Route path="/board-meetings"     element={<BoardMeetingsPage />} />
            <Route path="/term-sheets"        element={<TermSheetsPage />} />
            <Route path="/capital-calls"      element={<CapitalCallsPage />} />
            <Route path="/distributions"      element={<DistributionsPage />} />
            <Route path="/advisors"           element={<AdvisorsPage />} />
            <Route path="/intros"             element={<IntrosPage />} />
            <Route path="/pipeline-notes"     element={<PipelineNotesPage />} />
            <Route path="/exits"              element={<ExitsPage />} />
            <Route path="/audit-log"          element={<AuditLogPage />} />

            <Route path="/ai/ic-memo-draft"           element={<AIIcMemoDraftPage />} />
            <Route path="/ai/founder-call-summary"    element={<AIFounderCallSummaryPage />} />
            <Route path="/ai/comp-analysis"           element={<AICompAnalysisPage />} />
            <Route path="/ai/valuation-band"          element={<AIValuationBandPage />} />
            <Route path="/ai/executive-brief"         element={<AIExecutiveBriefPage />} />
            <Route path="/ai/lp-report-draft"         element={<AILpReportDraftPage />} />
            <Route path="/ai/exit-scenario"           element={<AIExitScenarioPage />} />
            <Route path="/ai/portfolio-flag"          element={<AIPortfolioFlagPage />} />
            <Route path="/ai/follow-on-recommend"     element={<AIFollowOnRecommendPage />} />
            <Route path="/ai/term-sheet-compare"      element={<AITermSheetComparePage />} />
            <Route path="/ai/intro-message-draft"     element={<AIIntroMessageDraftPage />} />
            <Route path="/ai/market-mapping"          element={<AIMarketMappingPage />} />
            <Route path="/ai/founder-redflag-extract" element={<AIFounderRedflagExtractPage />} />
            <Route path="/ai/cap-table-impact"        element={<AICapTableImpactPage />} />
            <Route path="/ai/distribution-waterfall"  element={<AIDistributionWaterfallPage />} />
            <Route path="/ai/fund-strategy-brief"     element={<AIFundStrategyBriefPage />} />

            {/* Apply pass 7 — backlog AI verb routes */}
            <Route path="/ai/pitch-deck-extract"         element={<AIPitchDeckExtractPage />} />
            <Route path="/ai/dd-qa-generate"             element={<AIDdQaGeneratePage />} />
            <Route path="/ai/market-size-estimate"       element={<AIMarketSizeEstimatePage />} />
            <Route path="/ai/founder-background-summary" element={<AIFounderBackgroundSummaryPage />} />
            <Route path="/ai/thesis-fit-score"           element={<AIThesisFitScorePage />} />

            {/* Apply pass 7 — backlog CRUD routes */}
            <Route path="/cap-tables"          element={<CapTablesPage />} />
            <Route path="/lp-comms-templates"  element={<LpCommsTemplatesPage />} />
            <Route path="/kpi-ingest-sources"  element={<KpiIngestSourcesPage />} />
            <Route path="/kpi-ingest-records"  element={<KpiIngestRecordsPage />} />

            <Route path="/webhooks" element={<WebhooksPage />} />

            <Route path="/custom-views" element={<CustomViewsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ShellRoutes />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
