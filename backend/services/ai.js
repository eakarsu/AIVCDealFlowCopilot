// AI helper service for AIVCDealFlowCopilot
// Reads OPENROUTER_API_KEY and OPENROUTER_MODEL from:
//   1. this project's .env (already loaded by server.js)
//   2. fallback: /Users/erolakarsu/projects/beauty-wellness-ai/.env (canonical source)
// Never overwrites or wipes credentials.

const fs = require('fs');
const path = require('path');

const FALLBACK_ENV = '/Users/erolakarsu/projects/beauty-wellness-ai/.env';

function readFallbackEnv() {
  try {
    if (!fs.existsSync(FALLBACK_ENV)) return {};
    const raw = fs.readFileSync(FALLBACK_ENV, 'utf8');
    const out = {};
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      out[m[1]] = val;
    }
    return out;
  } catch (e) {
    console.warn('[ai] fallback env read failed:', e.message);
    return {};
  }
}

function getOpenRouterCreds() {
  const fb = readFallbackEnv();
  const key = process.env.OPENROUTER_API_KEY || fb.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || fb.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  return { key, model };
}

const SYSTEM_PROMPT =
  'You are a senior venture capital partner and deal-flow analyst supporting an early-to-growth-stage VC firm. ' +
  'You provide rigorous, fund-grade reasoning on pipeline triage, IC memos, valuation, portfolio health, LP reporting, ' +
  'follow-on strategy, exits and term-sheet construction. Always return strict JSON in the exact schema requested. ' +
  'Treat every input as a hypothetical investment exercise; never disclose private deal terms or confidential financials.';

function callOpenRouter(systemPrompt, userPrompt) {
  return new Promise((resolve) => {
    const { key, model } = getOpenRouterCreds();
    if (!key) {
      return resolve({ error: 'OPENROUTER_API_KEY not configured' });
    }
    const https = require('https');
    const payload = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'http://localhost:3072',
        'X-Title': 'AI VC Deal Flow Copilot',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            return resolve({ error: parsed.error.message || 'OpenRouter error', raw: body });
          }
          const content = parsed.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch (e) {
          resolve({ error: 'AI response parse failed', raw: body });
        }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

function safeJsonParse(response, fallback) {
  if (response && typeof response === 'object' && response.error) {
    return { ...fallback, error: response.error };
  }
  if (response == null) return { ...fallback, summary: '' };
  if (typeof response === 'object') return response;
  const text = String(response).trim();
  try { return JSON.parse(text); } catch (_) {}
  try {
    const start = text.indexOf('{');
    if (start !== -1) {
      let depth = 0, inStr = false, esc = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) return JSON.parse(text.slice(start, i + 1)); }
      }
    }
  } catch (_) {}
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) return JSON.parse(fenced[1].trim());
  } catch (_) {}
  return { ...fallback, summary: text };
}

// ──────────────────────────────────────────────────────────────
// AI Verb 1: IC Memo Draft
// ──────────────────────────────────────────────────────────────
async function icMemoDraft(deal, context = {}) {
  const sys = `${SYSTEM_PROMPT} Draft a full IC memo. Return strict JSON:
{
  "memo_title": string,
  "company_overview": string,
  "thesis": string,
  "market_size": { "tam_usd": number, "sam_usd": number, "som_usd": number, "rationale": string },
  "team_assessment": [{ "name": string, "role": string, "strengths": [string], "concerns": [string] }],
  "traction_summary": string,
  "key_risks": [{ "risk": string, "severity": "low"|"medium"|"high", "mitigation": string }],
  "proposed_terms": { "round_size_usd": number, "valuation_usd": number, "ownership_pct": number, "board_seat": boolean },
  "recommendation": "invest"|"invest_with_conditions"|"pass"|"follow_up",
  "next_steps": [string],
  "summary": string
}`;
  const usr = `Deal:\n${JSON.stringify(deal, null, 2)}\n\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', key_risks: [], team_assessment: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 2: Founder Call Summary
// ──────────────────────────────────────────────────────────────
async function founderCallSummary(transcript, context = {}) {
  const sys = `${SYSTEM_PROMPT} Summarize a founder call. Return strict JSON:
{
  "company": string,
  "headline": string,
  "founder_signals": [{ "signal": string, "valence": "positive"|"neutral"|"negative", "evidence": string }],
  "asks_from_founder": [string],
  "open_questions": [string],
  "follow_up_actions": [{ "owner": string, "action": string, "deadline": string }],
  "conviction_score": number,
  "recommended_next_step": "deeper_diligence"|"ic_review"|"pass"|"second_call",
  "summary": string
}`;
  const usr = `Transcript / notes:\n${transcript}\n\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', founder_signals: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 3: Comp Analysis
// ──────────────────────────────────────────────────────────────
async function compAnalysis(company, peers = []) {
  const sys = `${SYSTEM_PROMPT} Build a public + private comp analysis. Return strict JSON:
{
  "subject_company": string,
  "comp_set": [{ "name": string, "type": "public"|"private", "stage_or_ticker": string, "revenue_multiple": number, "growth_rate": number, "rationale": string }],
  "median_revenue_multiple": number,
  "outliers": [{ "name": string, "why_outlier": string }],
  "implied_valuation_band_usd": { "low": number, "mid": number, "high": number },
  "comp_quality": "thin"|"adequate"|"robust",
  "summary": string
}`;
  const usr = `Subject:\n${JSON.stringify(company, null, 2)}\n\nPeer hints:\n${JSON.stringify(peers, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', comp_set: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 4: Valuation Band
// ──────────────────────────────────────────────────────────────
async function valuationBand(company, metrics = {}) {
  const sys = `${SYSTEM_PROMPT} Compute a defensible valuation band. Return strict JSON:
{
  "company": string,
  "methodologies": [{ "method": string, "valuation_usd": number, "assumptions": [string] }],
  "recommended_band_usd": { "low": number, "mid": number, "high": number },
  "primary_driver": string,
  "sensitivities": [{ "driver": string, "swing_usd": number, "direction": "up"|"down" }],
  "confidence": number,
  "summary": string
}`;
  const usr = `Company:\n${JSON.stringify(company, null, 2)}\n\nMetrics:\n${JSON.stringify(metrics, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', methodologies: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 5: Executive Brief (firm-level snapshot)
// ──────────────────────────────────────────────────────────────
async function executiveBrief(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Produce a Monday-morning partner brief on firm pipeline + portfolio. Return strict JSON:
{
  "headline": string,
  "pipeline_state": { "sourced": number, "diligence": number, "term_sheet": number, "closed_qtd": number, "narrative": string },
  "portfolio_state": { "performing_count": number, "watchlist_count": number, "at_risk_count": number, "narrative": string },
  "top_decisions_this_week": [{ "decision": string, "owner": string, "deadline": string, "recommendation": string }],
  "ic_calendar": [{ "deal": string, "date": string, "lead": string }],
  "fundraising_status": string,
  "next_24h_outlook": string,
  "summary": string
}`;
  const usr = `Firm snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 6: LP Report Draft
// ──────────────────────────────────────────────────────────────
async function lpReportDraft(fund, period, snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Draft a quarterly LP report. Return strict JSON:
{
  "fund": string,
  "period": string,
  "executive_summary": string,
  "nav_usd": number,
  "dpi": number,
  "tvpi": number,
  "irr_net": number,
  "new_investments_qtd": [{ "company": string, "amount_usd": number, "stage": string }],
  "exits_qtd": [{ "company": string, "type": string, "value_usd": number, "multiple": number }],
  "marks_qtd": [{ "company": string, "old_fair_value_usd": number, "new_fair_value_usd": number, "rationale": string }],
  "deployment_pace_pct_of_plan": number,
  "lp_questions_anticipated": [string],
  "summary": string
}`;
  const usr = `Fund: ${fund}\nPeriod: ${period}\nSnapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', new_investments_qtd: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 7: Exit Scenario
// ──────────────────────────────────────────────────────────────
async function exitScenario(company, context = {}) {
  const sys = `${SYSTEM_PROMPT} Model exit scenarios. Return strict JSON:
{
  "company": string,
  "scenarios": [{
    "name": "ipo"|"strategic_acquisition"|"financial_acquisition"|"secondary"|"write_off",
    "probability_pct": number,
    "exit_value_usd": number,
    "horizon_years": number,
    "fund_proceeds_usd": number,
    "moic": number,
    "narrative": string
  }],
  "expected_value_usd": number,
  "preferred_path": string,
  "key_blockers": [string],
  "summary": string
}`;
  const usr = `Company:\n${JSON.stringify(company, null, 2)}\n\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', scenarios: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 8: Portfolio Flag
// ──────────────────────────────────────────────────────────────
async function portfolioFlag(metrics = []) {
  const sys = `${SYSTEM_PROMPT} Scan portfolio metrics for early warning flags. Return strict JSON:
{
  "portfolio_health_score": number,
  "flags": [{
    "company_id": string,
    "kpi": string,
    "value": number,
    "period": string,
    "flag_type": "runway"|"burn"|"churn"|"growth"|"governance"|"team"|"market",
    "severity": "low"|"medium"|"high"|"critical",
    "rationale": string,
    "recommended_action": string
  }],
  "watchlist_additions": [string],
  "summary": string
}`;
  const usr = `Metrics:\n${JSON.stringify(metrics, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', flags: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 9: Follow-On Recommend
// ──────────────────────────────────────────────────────────────
async function followOnRecommend(investment, context = {}) {
  const sys = `${SYSTEM_PROMPT} Recommend follow-on action. Return strict JSON:
{
  "investment": string,
  "current_ownership_pct": number,
  "recommended_action": "double_down"|"pro_rata"|"super_pro_rata"|"hold"|"trim",
  "recommended_check_usd": number,
  "post_round_ownership_pct": number,
  "fund_concentration_after_pct": number,
  "key_factors": [{ "factor": string, "weight": "low"|"medium"|"high", "narrative": string }],
  "go_no_go": "go"|"caution"|"no_go",
  "summary": string
}`;
  const usr = `Investment:\n${JSON.stringify(investment, null, 2)}\n\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', key_factors: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 10: Term Sheet Compare
// ──────────────────────────────────────────────────────────────
async function termSheetCompare(versions = []) {
  const sys = `${SYSTEM_PROMPT} Compare two or more term sheet versions. Return strict JSON:
{
  "deltas": [{
    "clause": string,
    "version_a": string,
    "version_b": string,
    "founder_friendliness_change": "more"|"less"|"same",
    "investor_friendliness_change": "more"|"less"|"same",
    "rationale": string
  }],
  "negotiation_open_items": [string],
  "recommended_red_lines": [string],
  "founder_friendliness_score": number,
  "investor_friendliness_score": number,
  "summary": string
}`;
  const usr = `Term sheet versions:\n${JSON.stringify(versions, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', deltas: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 11: Intro Message Draft
// ──────────────────────────────────────────────────────────────
async function introMessageDraft(source, target, context = {}) {
  const sys = `${SYSTEM_PROMPT} Draft a warm-intro email. Return strict JSON:
{
  "source": string,
  "target": string,
  "subject": string,
  "body_markdown": string,
  "tone": "warm"|"formal"|"casual",
  "personalization_hooks": [string],
  "suggested_subject_lines": [string],
  "follow_up_cadence_days": number,
  "summary": string
}`;
  const usr = `Source: ${source}\nTarget: ${target}\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 12: Market Mapping
// ──────────────────────────────────────────────────────────────
async function marketMapping(sector, context = {}) {
  const sys = `${SYSTEM_PROMPT} Build a market map for a sector. Return strict JSON:
{
  "sector": string,
  "segments": [{
    "segment": string,
    "incumbents": [string],
    "challengers": [string],
    "whitespace": string,
    "thesis": string
  }],
  "macro_drivers": [string],
  "headwinds": [string],
  "investability_score": number,
  "summary": string
}`;
  const usr = `Sector: ${sector}\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', segments: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 13: Founder Red Flag Extract
// ──────────────────────────────────────────────────────────────
async function founderRedflagExtract(input, context = {}) {
  const sys = `${SYSTEM_PROMPT} Extract red flags from founder material. Return strict JSON:
{
  "founder": string,
  "red_flags": [{
    "flag": string,
    "category": "governance"|"integrity"|"market_fit"|"execution"|"team"|"finance"|"legal",
    "evidence": string,
    "severity": "low"|"medium"|"high"|"critical",
    "follow_up": string
  }],
  "yellow_flags": [string],
  "verification_actions": [string],
  "overall_risk": "low"|"medium"|"high"|"critical",
  "summary": string
}`;
  const usr = `Input material:\n${input}\n\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', red_flags: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 14: Cap Table Impact
// ──────────────────────────────────────────────────────────────
async function capTableImpact(currentCapTable, proposedRound) {
  const sys = `${SYSTEM_PROMPT} Model cap table impact of a proposed round. Return strict JSON:
{
  "pre_money_usd": number,
  "post_money_usd": number,
  "new_shares_issued": number,
  "stakeholder_impact": [{
    "stakeholder": string,
    "pre_round_pct": number,
    "post_round_pct": number,
    "dilution_pct": number
  }],
  "option_pool_change_pct": number,
  "founder_dilution_pct": number,
  "recommended_negotiation_points": [string],
  "summary": string
}`;
  const usr = `Current cap table:\n${JSON.stringify(currentCapTable, null, 2)}\n\nProposed round:\n${JSON.stringify(proposedRound, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', stakeholder_impact: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 15: Distribution Waterfall
// ──────────────────────────────────────────────────────────────
async function distributionWaterfall(fund, exitProceeds, context = {}) {
  const sys = `${SYSTEM_PROMPT} Compute LP/GP distribution waterfall. Return strict JSON:
{
  "fund": string,
  "exit_proceeds_usd": number,
  "tiers": [{
    "tier": string,
    "name": string,
    "to_lps_usd": number,
    "to_gp_usd": number,
    "running_lp_irr_pct": number,
    "rationale": string
  }],
  "total_to_lps_usd": number,
  "total_to_gp_carry_usd": number,
  "gp_carry_pct_realized": number,
  "hurdle_cleared": boolean,
  "summary": string
}`;
  const usr = `Fund: ${fund}\nExit proceeds USD: ${exitProceeds}\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', tiers: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 16: Fund Strategy Brief
// ──────────────────────────────────────────────────────────────
async function fundStrategyBrief(fund, snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Produce a fund strategy brief. Return strict JSON:
{
  "fund": string,
  "thesis_alignment": string,
  "deployment_pace_assessment": "ahead"|"on_plan"|"behind",
  "sector_concentration": [{ "sector": string, "pct_of_deployed": number, "comment": string }],
  "stage_concentration": [{ "stage": string, "pct_of_deployed": number, "comment": string }],
  "reserve_strategy_recommendation": string,
  "lp_messaging_themes": [string],
  "key_risks_to_thesis": [string],
  "summary": string
}`;
  const usr = `Fund:\n${JSON.stringify(fund, null, 2)}\n\nSnapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', sector_concentration: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 17: Pitch Deck Extract (LLM-only over caller-supplied text)
// No PDF/PPTX parsing on this side — the caller is expected to have
// already converted the deck to plaintext (deck export, OCR, etc.).
// ──────────────────────────────────────────────────────────────
async function pitchDeckExtract(deckText, context = {}) {
  const sys = `${SYSTEM_PROMPT} Extract structured fields from a pitch deck. Return strict JSON:
{
  "company_name": string,
  "one_liner": string,
  "stage": "pre_seed"|"seed"|"series_a"|"series_b"|"series_c"|"series_d"|"growth"|"unknown",
  "sector": string,
  "problem": string,
  "solution": string,
  "market_size_text": string,
  "business_model": string,
  "traction_metrics": [{ "metric": string, "value": string, "period": string }],
  "team": [{ "name": string, "role": string, "background": string }],
  "ask": { "round_size_usd": number, "valuation_usd": number, "use_of_funds": [string] },
  "competitors": [string],
  "extraction_confidence": number,
  "missing_fields": [string],
  "summary": string
}`;
  const usr = `Pitch deck text:\n${deckText}\n\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', traction_metrics: [], team: [], missing_fields: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 18: DD Q&A Generate
// ──────────────────────────────────────────────────────────────
async function ddQaGenerate(sector, stage, context = {}) {
  const sys = `${SYSTEM_PROMPT} Generate a due-diligence question set tailored to sector + stage. Return strict JSON:
{
  "sector": string,
  "stage": string,
  "categories": [{
    "category": "product"|"market"|"team"|"financials"|"legal"|"tech"|"customers"|"competition"|"governance"|"esg",
    "questions": [{
      "q": string,
      "priority": "p0"|"p1"|"p2",
      "owner_role": string,
      "expected_artifact": string
    }]
  }],
  "red_flag_screens": [string],
  "data_room_checklist": [string],
  "estimated_dd_days": number,
  "summary": string
}`;
  const usr = `Sector: ${sector}\nStage: ${stage}\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', categories: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 19: Market Size Estimate (TAM/SAM/SOM)
// ──────────────────────────────────────────────────────────────
async function marketSizeEstimate(productOrSector, context = {}) {
  const sys = `${SYSTEM_PROMPT} Estimate TAM/SAM/SOM with explicit assumptions. Return strict JSON:
{
  "product_or_sector": string,
  "tam": { "value_usd": number, "method": "top_down"|"bottom_up"|"mixed", "assumptions": [string] },
  "sam": { "value_usd": number, "filters_applied": [string], "assumptions": [string] },
  "som": { "value_usd": number, "horizon_years": number, "share_assumption_pct": number, "assumptions": [string] },
  "growth_rate_pct_cagr": number,
  "key_sensitivities": [{ "driver": string, "swing_pct": number }],
  "confidence": "low"|"medium"|"high",
  "summary": string
}`;
  const usr = `Product / sector: ${productOrSector}\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', key_sensitivities: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 20: Founder Background Summary (fuller bio synth)
// ──────────────────────────────────────────────────────────────
async function founderBackgroundSummary(founderName, material, context = {}) {
  const sys = `${SYSTEM_PROMPT} Synthesize a fund-grade founder background brief from bio / LinkedIn / press material. Return strict JSON:
{
  "founder": string,
  "elevator_bio": string,
  "career_arc": [{ "role": string, "company": string, "years": string, "notable": string }],
  "education": [{ "degree": string, "institution": string, "field": string, "year": string }],
  "domain_expertise": [string],
  "operator_signal": "weak"|"adequate"|"strong"|"exceptional",
  "network_strength": "low"|"medium"|"high",
  "prior_exits": [{ "company": string, "outcome": string, "value_usd": number }],
  "thesis_fit_signals": [string],
  "follow_up_diligence": [string],
  "summary": string
}`;
  const usr = `Founder name: ${founderName}\nMaterial:\n${material}\n\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', career_arc: [], education: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 21: Thesis-Fit Score
// ──────────────────────────────────────────────────────────────
async function thesisFitScore(deal, thesis, context = {}) {
  const sys = `${SYSTEM_PROMPT} Score a deal vs a fund thesis. Return strict JSON:
{
  "deal": string,
  "fund_thesis": string,
  "dimensions": [{
    "dimension": "sector"|"stage"|"geography"|"check_size"|"founder_profile"|"market_size"|"moat"|"timing",
    "score_0_100": number,
    "weight_pct": number,
    "rationale": string
  }],
  "overall_score_0_100": number,
  "verdict": "strong_fit"|"adjacent_fit"|"weak_fit"|"off_thesis",
  "must_haves_present": [string],
  "must_haves_missing": [string],
  "recommended_next_step": "ic_fast_track"|"deeper_diligence"|"watch"|"pass",
  "summary": string
}`;
  const usr = `Deal:\n${JSON.stringify(deal, null, 2)}\n\nFund thesis:\n${thesis}\n\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', dimensions: [] });
}

module.exports = {
  callOpenRouter,
  safeJsonParse,
  icMemoDraft,
  founderCallSummary,
  compAnalysis,
  valuationBand,
  executiveBrief,
  lpReportDraft,
  exitScenario,
  portfolioFlag,
  followOnRecommend,
  termSheetCompare,
  introMessageDraft,
  marketMapping,
  founderRedflagExtract,
  capTableImpact,
  distributionWaterfall,
  fundStrategyBrief,
  pitchDeckExtract,
  ddQaGenerate,
  marketSizeEstimate,
  founderBackgroundSummary,
  thesisFitScore,
};
