import React from 'react';
import AIPage from '../components/AIPage';
import { aiPortfolioFlag } from '../services/api';

export default function AIPortfolioFlagPage() {
  return (
    <AIPage
      title="AI · Portfolio Flag"
      feature="portfolio-flag"
      subtitle="Scan portfolio KPIs for early-warning flags (runway, churn, growth, governance)."
      inputs={[]}
      run={() => aiPortfolioFlag({})}
    />
  );
}
