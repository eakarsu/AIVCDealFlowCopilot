import React from 'react';
import NativeAdvisoryForm from '../components/NativeAdvisoryForm';
import { aiGovernedBrief, getGovernedBriefHistory } from '../services/api';

const fields = [
  {
    "key": "company_name",
    "label": "Company name",
    "type": "text"
  },
  {
    "key": "stage",
    "label": "Stage",
    "type": "text"
  },
  {
    "key": "sector",
    "label": "Sector",
    "type": "text"
  },
  {
    "key": "round_size_usd",
    "label": "Round size (USD)",
    "type": "number",
    "min": 0,
    "step": 0.01
  },
  {
    "key": "valuation_usd",
    "label": "Valuation (USD)",
    "type": "number",
    "min": 0,
    "step": 0.01
  },
  {
    "key": "notes",
    "label": "Draft context and review questions",
    "type": "textarea"
  }
];
const samples = [
  {
    "label": "Demo AI · Seed planning",
    "values": {
      "company_name": "Fictional Cedar Research",
      "stage": "Seed",
      "sector": "Illustrative workflow software",
      "round_size_usd": 2000000,
      "valuation_usd": 10000000,
      "notes": "Fictional investment exercise. Review hypothetical positioning, uncertainties and due-diligence questions. No verified traction, actual deal terms, investment approval or confidential financials are supplied."
    }
  },
  {
    "label": "Demo AI · Growth review",
    "values": {
      "company_name": "Fictional Harbor Analytics",
      "stage": "Series A",
      "sector": "Illustrative analytics software",
      "round_size_usd": 8000000,
      "valuation_usd": 40000000,
      "notes": "Fictional review draft. Compare illustrative capital needs and potential risks; identify evidence still needed before a human investment decision. These values do not represent an actual company or approved terms."
    }
  },
  {
    "label": "Demo AI · Follow-up checklist",
    "values": {
      "company_name": "Fictional Meadow Systems",
      "stage": "Pre-seed",
      "sector": "Illustrative operations tooling",
      "round_size_usd": 750000,
      "valuation_usd": 5000000,
      "notes": "Fictional diligence planning. Prepare a follow-up checklist and missing-data questions. Do not infer verified team credentials, real traction, approval, ledger delivery or executed investment."
    }
  }
];

export default function GovernedAIBriefPage() { return <NativeAdvisoryForm title="AI · Governed Deal Brief" description="Draft a hypothetical investment brief through the supported governed deal workflow. Actual investment review, evidence, approvals and provider delivery stay separate." fields={fields} samples={samples} onRun={aiGovernedBrief} loadHistory={getGovernedBriefHistory} />; }
