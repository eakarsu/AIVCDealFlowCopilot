const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const ai = require('../services/ai');

async function record(feature, input, output) {
  try {
    await pool.query(
      'INSERT INTO ai_results (feature, input, output) VALUES ($1, $2, $3)',
      [feature, input || {}, output || {}]
    );
  } catch (e) {
    console.warn(`[ai] failed to record ${feature}:`, e.message);
  }
}

// ──────────────────────────────────────────────────────────────
// Sample fills — 5 realistic VC scenarios per verb.
// Keys map 1:1 to the field `key`s used by the frontend AI page components.
// ──────────────────────────────────────────────────────────────
const SAMPLES = {
  'ic-memo-draft': [
    {
      label: 'Halcyon AI — Series B enterprise AI',
      values: {
        company_name: 'Halcyon AI',
        stage: 'series_b',
        sector: 'enterprise_ai',
        round_size_usd: 45000000,
        valuation_usd: 480000000,
        notes: 'Foundation-model agent platform for regulated industries. $12.5M ARR, NDR 129%, 320 logos, profitable unit economics. Founder ex-OpenAI head of applied. Lead competitor Cohere. Demand from JPM, Goldman, Anthem and Lockheed.',
      },
    },
    {
      label: 'BlueGrid Energy — climate Series A',
      values: {
        company_name: 'BlueGrid Energy',
        stage: 'series_a',
        sector: 'climate',
        round_size_usd: 22000000,
        valuation_usd: 140000000,
        notes: 'Grid-scale iron-air storage company. Three utility pilots active (Duke, Xcel, PG&E). Cell tech derisked through 2,000-cycle bench data. Founder ex-Tesla Megapack lead. Series B will require strategic.',
      },
    },
    {
      label: 'Lumen Robotics — Series A deeptech',
      values: {
        company_name: 'Lumen Robotics',
        stage: 'series_a',
        sector: 'robotics',
        round_size_usd: 18000000,
        valuation_usd: 90000000,
        notes: 'Bin-picking foundation model + collaborative arm for warehouses. $4.2M ARR up 8x YoY. Amazon and DHL paid pilots converted. CMU spinout, CEO is Mira Okonkwo (ex-CMU Robotics Institute).',
      },
    },
    {
      label: 'Volans Bio — Series C biotech',
      values: {
        company_name: 'Volans Bio',
        stage: 'series_c',
        sector: 'biotech',
        round_size_usd: 80000000,
        valuation_usd: 950000000,
        notes: 'Phase 2 cardiometabolic candidate; FDA breakthrough designation expected. Strong KOL support. Crossovers leading. Risk: single-asset company with binary readout in Q4.',
      },
    },
    {
      label: 'NodeCipher Security — Series B cyber',
      values: {
        company_name: 'NodeCipher Security',
        stage: 'series_b',
        sector: 'cybersecurity',
        round_size_usd: 40000000,
        valuation_usd: 480000000,
        notes: 'Identity-graph and lateral-movement detection. $9.8M ARR, NDR 142%. Ex-NSA CEO. Three Fortune 50 design wins. Comp: Wiz, Abnormal Security.',
      },
    },
  ],

  'founder-call-summary': [
    {
      label: 'First call — Halcyon AI CEO',
      values: {
        transcript: 'CEO Aisha Rahman walked through agent platform demo (12 min), shared NDR 129% real number, discussed pivot from chatbot to agent orchestration in 2024 after foundation model commoditization. Strong opinion on closed-source moats. Asked for pro-rata in next round (Series C) at $1.2B. Mentioned Sequoia in advanced diligence. Wants partner intro to two enterprise CISO leads.',
      },
    },
    {
      label: 'Second call — Lumen Robotics CEO',
      values: {
        transcript: 'Mira Okonkwo demoed end-to-end bin-picking on three new SKU classes. Discussed Amazon expansion path: 12 fulfillment centers signed, target 40 by EOY. Burn rate $480k/month, runway 22 months. Wants Series B in Q4 at $300M pre. No competing term sheet yet but rumored a16z is sniffing. Asks: intro to ex-Kiva ops lead, advisor with Walmart relationship.',
      },
    },
    {
      label: 'Update call — NodeCipher CEO',
      values: {
        transcript: 'CEO Naomi Brand briefed on Q1 close: $9.8M ARR (+34% QoQ), three F50 design wins (JPM, ExxonMobil, UnitedHealth). NDR 142%. Hiring 22 in next 90 days, mostly enterprise AEs. Concern: Wiz raised $1B at $12B, valuation comp is brutal. Brand wants to hold Series C until Q3 2026.',
      },
    },
    {
      label: 'Diligence call — Volans Bio CSO',
      values: {
        transcript: 'CSO Dr. Yael Bensimon walked through Phase 2 protocol. 312 patients, 14 sites. Primary endpoint reads out Q4. Statistical powering 90% at p<0.01. FDA breakthrough designation in flight, expects answer by Q3. IP estate strong, two Orange Book listings expected. Backup asset 18 months behind lead.',
      },
    },
    {
      label: 'Pass call — Ortus FinPay CEO',
      values: {
        transcript: 'Camila Restrepo (CEO) call to communicate pass. CAC has crept from $42 to $138 since Sept; LTV/CAC now ~1.4. Mexico interchange caps under regulatory review. Strong founder, wrong cycle. Offered to stay in touch and to make 2 intros (Stripe regional VP, Kavak ex-CFO).',
      },
    },
  ],

  'comp-analysis': [
    {
      label: 'Halcyon AI vs enterprise AI peers',
      values: {
        company_name: 'Halcyon AI',
        peers_text: 'Cohere (private), Anthropic (private), Snowflake (NYSE: SNOW), Palantir (NYSE: PLTR), MongoDB (NASDAQ: MDB), Glean (private), Writer (private)',
      },
    },
    {
      label: 'Lumen Robotics vs warehouse robotics',
      values: {
        company_name: 'Lumen Robotics',
        peers_text: 'Symbotic (NASDAQ: SYM), Berkshire Grey (NASDAQ: BGRY), AutoStore (Oslo), 6 River Systems (acquired by Shopify), Locus Robotics (private), Covariant (private), Pickle Robot (private)',
      },
    },
    {
      label: 'NodeCipher vs cyber comps',
      values: {
        company_name: 'NodeCipher Security',
        peers_text: 'Wiz (private), Abnormal Security (private), CrowdStrike (NASDAQ: CRWD), SentinelOne (NYSE: S), Zscaler (NASDAQ: ZS), Cyberark (NASDAQ: CYBR), Snyk (private)',
      },
    },
    {
      label: 'BlueGrid Energy vs grid storage',
      values: {
        company_name: 'BlueGrid Energy',
        peers_text: 'Fluence (NASDAQ: FLNC), Stem (NYSE: STEM), Form Energy (private), ESS Tech (NYSE: GWH), Energy Vault (NYSE: NRGV), Eos Energy (NASDAQ: EOSE)',
      },
    },
    {
      label: 'Volans Bio vs cardiometabolic',
      values: {
        company_name: 'Volans Bio',
        peers_text: 'Madrigal Pharma (NASDAQ: MDGL), Akero Therapeutics (NASDAQ: AKRO), 89bio (NASDAQ: ETNB), Viking Therapeutics (NASDAQ: VKTX), Structure Therapeutics (NASDAQ: GPCR)',
      },
    },
  ],

  'valuation-band': [
    {
      label: 'Halcyon AI Series B band',
      values: {
        company_name: 'Halcyon AI',
        metrics_text: 'ARR 12.5M, growth 220% YoY, NDR 129%, gross margin 78%, burn multiple 0.9, 320 logos, F50 anchors signed',
      },
    },
    {
      label: 'BlueGrid Series A band',
      values: {
        company_name: 'BlueGrid Energy',
        metrics_text: 'Pre-revenue, three utility pilots with paid LOIs totaling 45M, cycle data 2000-cycle bench, gross margin model 38% at scale',
      },
    },
    {
      label: 'Lumen Robotics Series A band',
      values: {
        company_name: 'Lumen Robotics',
        metrics_text: 'ARR 4.2M, growth 8x YoY, gross margin 61%, anchor customers Amazon and DHL, 12 sites live, contract value 350k average per site',
      },
    },
    {
      label: 'Cumulus Workloads — late Series B',
      values: {
        company_name: 'Cumulus Workloads',
        metrics_text: 'ARR 38M, growth 95% YoY, NDR 118%, 2100 logos, gross margin 72%, FCF burn (12M annualized)',
      },
    },
    {
      label: 'Kestrel Defense — seed band',
      values: {
        company_name: 'Kestrel Defense',
        metrics_text: 'ARR 950k, DoD SBIR Phase II + 18.5M pipeline, no NDR yet, gross margin model 55%, founder ex-USMC',
      },
    },
  ],

  'executive-brief': [
    { label: 'Default — no bias',                   values: { notes: '' } },
    { label: 'Bias toward Fund IV deployment',      values: { notes: 'Focus on Fund IV: deployment pace vs. plan, sector concentration vs. mandate, near-term IC calendar and reserve allocations.' } },
    { label: 'Bias toward portfolio at-risk list',  values: { notes: 'Focus on portfolio at-risk list, runway < 12 months companies, governance issues and board-level interventions.' } },
    { label: 'Bias toward LP fundraising',          values: { notes: 'Focus on Fund V fundraise, LP commitment pipeline, anchor LP status, anticipated final close timing.' } },
    { label: 'Bias toward AI fund concentration',   values: { notes: 'Focus on Fund AI: deployment, sector concentration, exposure to foundation-model commoditization, follow-on reserve.' } },
  ],

  'lp-report-draft': [
    {
      label: 'Fund IV — 2026 Q1',
      values: {
        fund: 'FUND-IV',
        period: '2026Q1',
        notes: 'Two new investments (Halcyon AI Series B, Cumulus Workloads add-on). One markup (NodeCipher +3.2x). No exits this quarter. Deployment pace 14% of fund, on-plan.',
      },
    },
    {
      label: 'Fund III — 2026 Q1',
      values: {
        fund: 'FUND-III',
        period: '2026Q1',
        notes: 'One exit (CMP-102 IPO at 12.5x). One follow-on. Three markups (Lumen +2.1x, Cumulus +1.8x, Kestrel +1.3x). DPI now 0.42, TVPI 2.41.',
      },
    },
    {
      label: 'Fund Climate I — 2026 Q1',
      values: {
        fund: 'FUND-CLI',
        period: '2026Q1',
        notes: 'One new investment (Veridian add-on). Two markups (BlueGrid +1.4x, Form Energy comp +1.2x). 16M called this quarter.',
      },
    },
    {
      label: 'Fund I — final wind-down report',
      values: {
        fund: 'FUND-I',
        period: '2026Q1',
        notes: 'Final wind-down period. One last distribution (18M cash from CMP-105 acquisition). DPI 2.14, IRR net 24%. Fund will close June 2026.',
      },
    },
    {
      label: 'Fund AI I — 2026 Q1',
      values: {
        fund: 'FUND-AI',
        period: '2026Q1',
        notes: 'One new investment (Halcyon Series B co-led). Two add-ons. Two markups. 22M called. Sector concentration 78% enterprise AI / 22% applied AI infra.',
      },
    },
  ],

  'exit-scenario': [
    {
      label: 'Halcyon AI exit scenarios',
      values: {
        company_name: 'Halcyon AI',
        context_notes: 'Currently $12.5M ARR, growing 220%. Plausible IPO window 2028-2029. Strategic acquirers: Microsoft, Salesforce, ServiceNow, IBM. Fund III owns 9.4% post-money.',
      },
    },
    {
      label: 'Lumen Robotics exit scenarios',
      values: {
        company_name: 'Lumen Robotics',
        context_notes: '$4.2M ARR. Strategic acquirers: Amazon, Honeywell, Symbotic. IPO unlikely before 2030. Fund IV owns 18% post-money.',
      },
    },
    {
      label: 'Volans Bio exit scenarios',
      values: {
        company_name: 'Volans Bio',
        context_notes: 'Pre-revenue Phase 2 biotech. Likely M&A by big pharma after Phase 3 readout. Binary risk on Q4 Phase 2 readout. Fund BIO owns 7% post-money.',
      },
    },
    {
      label: 'Cumulus Workloads exit scenarios',
      values: {
        company_name: 'Cumulus Workloads',
        context_notes: '$38M ARR, growth 95%. IPO probable in 18-30 months. Strategic acquirers: AWS, Datadog, Splunk. Fund III owns 6.2% post-money.',
      },
    },
    {
      label: 'Kestrel Defense exit scenarios',
      values: {
        company_name: 'Kestrel Defense',
        context_notes: 'Defense-tech with DoD anchor. Acquirers: Lockheed, Anduril, Palantir. IPO unlikely. Fund SEC owns 14% post-money.',
      },
    },
  ],

  'portfolio-flag': [
    { label: 'Scan full portfolio (default)', values: {} },
    { label: 'Scan full portfolio (default)', values: {} },
    { label: 'Scan full portfolio (default)', values: {} },
    { label: 'Scan full portfolio (default)', values: {} },
    { label: 'Scan full portfolio (default)', values: {} },
  ],

  'follow-on-recommend': [
    {
      label: 'Cumulus Workloads — Series C',
      values: {
        investment_id: 'INV-2024-002',
        notes: 'Cumulus Series C, expected $200M raise at $4.1B pre. We own 6.2% post-prior. Pro-rata check ~ $12M; super pro-rata would be $20M. Fund IV reserve sufficient.',
      },
    },
    {
      label: 'Halcyon AI — Series C bridge',
      values: {
        investment_id: 'INV-2025-002',
        notes: 'Halcyon raising bridge $80M at $1.2B flat. We own 4.2%. Strong NDR, but valuation flat is signal — competitor traction question. Pro-rata $3.4M.',
      },
    },
    {
      label: 'Veridian Crops — Series B',
      values: {
        investment_id: 'INV-2026-003',
        notes: 'Veridian Series B planned 28M at 110M pre. Runway only 11 months. Burn 1.1M/mo. We are 9% post-prior. Pro-rata 2.5M would be capital-protective.',
      },
    },
    {
      label: 'NodeCipher — Series C',
      values: {
        investment_id: 'INV-2025-001',
        notes: 'NodeCipher Series C 120M at 1.8B. We own 5.1%. Concentration if super-pro-rata: 9.8% of Fund SEC. Hot deal, oversubscribed.',
      },
    },
    {
      label: 'Lumen Robotics — Series B',
      values: {
        investment_id: 'INV-2026-001',
        notes: 'Lumen Series B led by Tiger at 320M pre. We own 18% post-seed. Pro-rata 4.5M; trimming via secondary possible. Concentration concern.',
      },
    },
  ],

  'term-sheet-compare': [
    {
      label: 'BlueGrid v1 vs v2',
      values: {
        versions_text: 'V1 (lead-proposed 2026-04-12): pre $130M, 1x non-participating, 15% option pool post-close, weighted-average AD, single-trigger acceleration, founder vesting 4yr/1yr.\n\nV2 (founder counter 2026-04-19): pre $160M, 1x non-participating, 12% option pool pre-close, broad-based weighted-average AD, double-trigger acceleration, founder vesting 3yr/1yr.',
      },
    },
    {
      label: 'Halcyon v1 vs v2',
      values: {
        versions_text: 'V1 (Sequoia lead): pre $1.15B, 1x non-participating, 8% option pool post-close, full ratchet AD, single-trigger acceleration.\n\nV2 (co-leads counter): pre $1.25B, 1x non-participating, 8% option pool post-close, weighted-average AD, double-trigger acceleration, two MFN warrants for early investors.',
      },
    },
    {
      label: 'Lumen Series B drafts',
      values: {
        versions_text: 'V1 (Tiger lead): pre $300M, 1x non-participating, 10% option pool post-close, founder vesting reset 4yr/1yr cliff, board seat.\n\nV2 (founder counter): pre $340M, 1x non-participating, 8% option pool pre-close, NO founder vesting reset, two independent board seats vs investor.',
      },
    },
    {
      label: 'NodeCipher Series B',
      values: {
        versions_text: 'V1 (a16z lead): pre $460M, 1x non-participating, 12% option pool, founder vesting acceleration single-trigger, broad-based AD.\n\nV2 (co-investor counter): pre $500M, 1x non-participating, 8% option pool, double-trigger acceleration, narrow-based AD.',
      },
    },
    {
      label: 'Veridian Series A',
      values: {
        versions_text: 'V1 (lead): pre $30M, 1x non-participating, 18% pool, single-trigger, founder vesting reset.\n\nV2 (founder): pre $42M, 1x non-participating, 12% pool, double-trigger, no founder vesting reset.',
      },
    },
  ],

  'intro-message-draft': [
    {
      label: 'Ex-Stripe CTO → Halcyon CEO',
      values: {
        source: 'Will Larson (ex-CTO Calm, ex-Stripe)',
        target: 'Aisha Rahman, CEO Halcyon AI',
        context_notes: 'Will is a personal friend of mine and former Stripe colleague. Halcyon is in our portfolio (Fund IV). Will is interested in advisory work in applied AI. Looking for warm intro for a 30-min coffee.',
      },
    },
    {
      label: 'GV partner → Lumen Robotics CEO',
      values: {
        source: 'David Lawee (GV partner)',
        target: 'Mira Okonkwo, CEO Lumen Robotics',
        context_notes: 'David texted me asking for an intro to Mira — he is looking to lead the Series B and would put $30M in. We support — we want a sophisticated co-investor.',
      },
    },
    {
      label: 'Brigadier Reyes → Kestrel CEO',
      values: {
        source: 'BG (Ret.) Tom Reyes',
        target: 'Sven Holmberg, CEO Kestrel Defense',
        context_notes: 'Tom is our defense advisor and would be invaluable on the Kestrel board as an independent. Sven knows Tom by reputation; they have not met.',
      },
    },
    {
      label: 'Roche scientist → Volans CSO',
      values: {
        source: 'Dr. Patrick Sanwald (Roche Translational Medicine)',
        target: 'Dr. Yael Bensimon, CSO Volans Bio',
        context_notes: 'Patrick is a leading KOL on cardiometabolic biomarkers. We want to introduce him as a potential SAB member ahead of Phase 2 readout.',
      },
    },
    {
      label: 'A16Z principal → NodeCipher CEO',
      values: {
        source: 'Joel de la Garza (a16z security partner)',
        target: 'Naomi Brand, CEO NodeCipher Security',
        context_notes: 'Joel wants to participate in NodeCipher Series C as a co-investor with us. He has deep security network — would be a strong co-lead.',
      },
    },
  ],

  'market-mapping': [
    { label: 'Enterprise AI agents',   values: { sector: 'enterprise AI agents',     focus_notes: 'Focus on regulated industries: financial services, healthcare, defense.' } },
    { label: 'Grid-scale storage',     values: { sector: 'grid-scale energy storage', focus_notes: 'Focus on long-duration (>4hr) and ultra-low-cost chemistries.' } },
    { label: 'Industrial robotics',    values: { sector: 'warehouse and industrial robotics', focus_notes: 'Focus on bin-picking, kitting, and last-mile fulfillment automation.' } },
    { label: 'Defense tech / dual-use',values: { sector: 'defense tech (dual-use)',  focus_notes: 'Focus on autonomy, ISR, and counter-UAS. DoD program pull required.' } },
    { label: 'Cardiometabolic biotech',values: { sector: 'cardiometabolic biotech',   focus_notes: 'Focus on GLP-1 adjacencies, NASH, heart failure.' } },
  ],

  'founder-redflag-extract': [
    {
      label: 'Backchannel reference — Camila Restrepo (Ortus)',
      values: {
        founder_name: 'Camila Restrepo',
        material: 'Two ex-Square colleagues (regional VP, controller) describe Camila as "brilliant, but ran weekly forecasts as a sales game." Burned through two CFOs in 18 months. Company terminated audit firm KPMG in Q3 — replaced with smaller firm. Pre-revenue marketing claims of 5x growth do not reconcile with bank statements provided in diligence.',
      },
    },
    {
      label: 'Founder LinkedIn + press scan — Reza Karimi (Pixel & Quill)',
      values: {
        founder_name: 'Reza Karimi',
        material: 'Founder has been on LinkedIn for 14 months. Previous role listed as "Product Lead at Stripe" — Stripe directory has no record. Founder Twitter shows extensive arbitrage of competitor marketing. Press release claims partnership with Disney — Disney corporate dev has no record of contract.',
      },
    },
    {
      label: 'Cap table review — Cumulus Workloads',
      values: {
        founder_name: 'Ben Tachibana',
        material: 'Cap table review reveals founder issued 6% of company in side-letter SAFEs to undisclosed individuals in 2023, not surfaced in earlier diligence. Board minutes show three resolutions passed without quorum. Auditor mentioned timing of revenue recognition on multi-year contracts is "aggressive."',
      },
    },
    {
      label: 'Customer reference call — NodeCipher',
      values: {
        founder_name: 'Naomi Brand',
        material: 'Customer reference call with JPM CISO: extremely positive on product. Internal: Naomi reported a 4-day production outage in Q4 to the team but never raised in board update. Board package showed "uptime 99.97%" — calculation excluded outage.',
      },
    },
    {
      label: 'Founder background — Eduardo Cruz (Veridian)',
      values: {
        founder_name: 'Eduardo Cruz',
        material: 'Eduardo lists PhD from Cornell on bio. Cornell records show Eduardo withdrew in 2018 ABD. Previous startup (AgroTech) ended in lawsuit with co-founder over IP; settled out of court 2020. Three former employees describe a "yelling culture" but defend his technical talent.',
      },
    },
  ],

  'cap-table-impact': [
    {
      label: 'Halcyon Series C model',
      values: {
        company_name: 'Halcyon AI',
        cap_table_text: 'Founders 48%, Employees option pool 12%, Seed (NEA) 9%, Series A (Sequoia) 14%, Series B (Acme Fund IV) 9%, Series B (a16z) 8%',
        proposed_round_text: 'Series C $200M at $4.1B pre-money, 10% option pool refresh post-close',
      },
    },
    {
      label: 'BlueGrid Series A model',
      values: {
        company_name: 'BlueGrid Energy',
        cap_table_text: 'Founders 72%, Employees 8%, Pre-seed (Lowercarbon) 14%, Angels 6%',
        proposed_round_text: 'Series A $22M at $140M pre, 15% option pool post-close',
      },
    },
    {
      label: 'Lumen Series B model',
      values: {
        company_name: 'Lumen Robotics',
        cap_table_text: 'Founders 38%, Employees 14%, Pre-seed (CMU) 6%, Seed (Acme Seed) 18%, Series A (Acme Fund IV) 12%, Bridge (angels) 4%, Series A pro-rata investors 8%',
        proposed_round_text: 'Series B $60M at $340M pre, 10% pool refresh',
      },
    },
    {
      label: 'NodeCipher Series C model',
      values: {
        company_name: 'NodeCipher Security',
        cap_table_text: 'Founders 32%, Employees 16%, Seed (YC) 7%, Series A (a16z) 12%, Series B (Acme + a16z) 18%, Bridge 4%, Strategic (Palo Alto) 6%',
        proposed_round_text: 'Series C $120M at $1.8B pre, 8% pool refresh',
      },
    },
    {
      label: 'Veridian Series B (down)',
      values: {
        company_name: 'Veridian Crops',
        cap_table_text: 'Founders 41%, Employees 11%, Seed (Acme Climate) 22%, Series A (Acme Climate + Lowercarbon) 18%, Angels 8%',
        proposed_round_text: 'Series B $28M at $110M pre (DOWN ROUND from $140M previous), 15% pool refresh',
      },
    },
  ],

  'distribution-waterfall': [
    {
      label: 'Fund I — final wind-down',
      values: {
        fund: 'FUND-I',
        exit_proceeds_usd: 18000000,
        context_notes: '8% hurdle, 20% carry, European waterfall, fund-as-a-whole, $120M called total to date',
      },
    },
    {
      label: 'Fund II — large strategic exit',
      values: {
        fund: 'FUND-II',
        exit_proceeds_usd: 180000000,
        context_notes: '8% hurdle, 20% carry, American waterfall, deal-by-deal, $220M committed',
      },
    },
    {
      label: 'Fund III — Cumulus IPO',
      values: {
        fund: 'FUND-III',
        exit_proceeds_usd: 240000000,
        context_notes: '8% hurdle, 20% carry, European waterfall, $350M committed, $310M called',
      },
    },
    {
      label: 'Fund Growth — large acquisition',
      values: {
        fund: 'FUND-GR',
        exit_proceeds_usd: 450000000,
        context_notes: '7% hurdle, 25% carry above hurdle (super-carry tier above 3x), European waterfall, $410M committed',
      },
    },
    {
      label: 'Fund Bio — biotech IPO',
      values: {
        fund: 'FUND-BIO',
        exit_proceeds_usd: 95000000,
        context_notes: '8% hurdle, 20% carry, deal-by-deal, $200M committed',
      },
    },
  ],

  'fund-strategy-brief': [
    { label: 'Fund IV — current vintage',  values: { fund_id: 'FUND-IV',   notes: 'Mid-deployment cycle, ~45% deployed across 26 investments.' } },
    { label: 'Fund AI I — concentration',  values: { fund_id: 'FUND-AI',   notes: 'Concerns about over-concentration in enterprise AI sub-sector.' } },
    { label: 'Fund Climate I',             values: { fund_id: 'FUND-CLI',  notes: 'Long-duration storage and grid-tied thesis; check on hardtech timelines.' } },
    { label: 'Fund Security I',            values: { fund_id: 'FUND-SEC',  notes: 'Cyber + defense-tech dual mandate; DoD pull required for defense bets.' } },
    { label: 'Fund Opportunities',         values: { fund_id: 'FUND-OPP',  notes: 'Late-stage opportunity fund, follows existing winners; deployment behind plan.' } },
  ],

  'pitch-deck-extract': [
    {
      label: 'Halcyon AI deck text',
      values: {
        deck_text: 'Slide 1: Halcyon AI — Agents for regulated enterprises.\nSlide 2: Foundation model commoditization means orchestration is where margin lives.\nSlide 3: Product — agent platform with 38 connectors, compliance attestations for SOC2/HIPAA/FedRAMP.\nSlide 4: Traction — $12.5M ARR, 220% YoY, 320 customers, NDR 129%, gross margin 78%.\nSlide 5: Team — CEO Aisha Rahman (ex-OpenAI head of applied), CTO Ben Lee (ex-Palantir).\nSlide 6: Market — TAM $180B by 2030, SAM $42B in regulated industries, SOM $4B (we target top 1000 enterprises).\nSlide 7: Business model — annual SaaS + per-agent metered.\nSlide 8: Competitors — Cohere, Glean, Writer.\nSlide 9: Ask — $45M Series B at $480M pre. Use of funds: enterprise GTM (60%), R&D (30%), G&A (10%).',
        context_notes: 'Series B IC pre-read. Focus extraction on traction quality, moat, GTM motion, compliance posture and financing ask.',
      },
    },
    {
      label: 'BlueGrid Energy deck text',
      values: {
        deck_text: 'Slide 1: BlueGrid — long-duration iron-air storage for the grid.\nSlide 2: Problem — duck curves are getting worse, lithium can\'t go past 4 hours economically.\nSlide 3: Solution — iron-air chemistry, 100-hour duration, $20/kWh at scale.\nSlide 4: Tech derisking — 2000-cycle bench data, three utility pilots (Duke, Xcel, PG&E).\nSlide 5: Team — CEO Mark Chen (ex-Tesla Megapack lead), CTO Dr. Priya Nair (MIT materials sci).\nSlide 6: Market — $300B annual storage TAM by 2035.\nSlide 7: Ask — $22M Series A at $140M pre.',
        context_notes: 'Climate Fund screening memo. Emphasize utility pilot credibility, manufacturing scale-up risk, policy tailwinds and capital intensity.',
      },
    },
    {
      label: 'Lumen Robotics deck text',
      values: {
        deck_text: 'Slide 1: Lumen — bin-picking foundation model + cobot arm.\nSlide 2: Warehouses need flexibility lithium-ion conveyors can\'t deliver.\nSlide 3: Product — vision foundation model + Lumen-Arm hardware bundle.\nSlide 4: Traction — $4.2M ARR, 8x YoY, Amazon + DHL paid pilots converted to 12 sites.\nSlide 5: Team — CEO Mira Okonkwo (ex-CMU Robotics), CTO Diego Vázquez (ex-Boston Dynamics).\nSlide 6: Ask — $18M Series A at $90M pre.',
        context_notes: 'Robotics Series A diligence. Pull out customer expansion mechanics, site economics, hardware margin assumptions and deployment constraints.',
      },
    },
    {
      label: 'Veridian Crops deck text',
      values: {
        deck_text: 'Slide 1: Veridian — drought-resilient row crops via gene editing.\nSlide 2: Climate change is shrinking arable land 1.5% per year.\nSlide 3: Product — CRISPR-edited corn + soy seed varieties; first product gen approved EPA 2025.\nSlide 4: Traction — three midwest seed-distributor contracts, $1.1M pilot revenue 2025.\nSlide 5: Team — CEO Eduardo Cruz (ex-Pioneer), CSO Dr. Maya Holm (ex-Cornell).\nSlide 6: Ask — $28M Series B at $110M pre.',
        context_notes: 'Agtech follow-up review. Focus on regulatory approvals, channel concentration, seed-distributor contracts and R&D milestone risk.',
      },
    },
    {
      label: 'Kestrel Defense deck text',
      values: {
        deck_text: 'Slide 1: Kestrel — autonomous counter-UAS for forward operating bases.\nSlide 2: Drone threat is exploding; legacy SAM systems cost-prohibitive.\nSlide 3: Product — modular interceptor + edge-AI targeting; AFWERX Phase II awarded.\nSlide 4: Traction — $950k ARR via DoD SBIR, $18.5M pipeline.\nSlide 5: Team — CEO Sven Holmberg (ex-USMC, Anduril), CTO Dr. Anika Rao.\nSlide 6: Ask — $12M seed at $48M pre.',
        context_notes: 'Defense-tech seed screen. Extract DoD budget path, procurement dependencies, dual-use potential and founder/government access.',
      },
    },
  ],

  'dd-qa-generate': [
    { label: 'Enterprise AI · Series B', values: { sector: 'enterprise AI', stage: 'series_b', focus_notes: 'Customer concentration, model dependency, security/compliance.' } },
    { label: 'Climate hardware · Series A', values: { sector: 'climate hardware (grid storage)', stage: 'series_a', focus_notes: 'Manufacturing scale-up risk, utility pilot economics.' } },
    { label: 'Industrial robotics · Series A', values: { sector: 'industrial robotics', stage: 'series_a', focus_notes: 'Unit economics per site, customer expansion mechanics.' } },
    { label: 'Biotech · Series C', values: { sector: 'cardiometabolic biotech', stage: 'series_c', focus_notes: 'Clinical trial design, regulatory path, IP estate.' } },
    { label: 'Cybersecurity · Series B', values: { sector: 'cybersecurity', stage: 'series_b', focus_notes: 'Product differentiation vs Wiz/Abnormal, NDR retention, channel.' } },
  ],

  'market-size-estimate': [
    {
      label: 'Enterprise AI agents',
      values: {
        product_or_sector: 'Enterprise AI agents for regulated industries',
        context_notes: 'Targeting financial services, healthcare, defense. Reference TAM bottom-up by # of F2000 enterprises × avg annual spend.',
      },
    },
    {
      label: 'Long-duration grid storage',
      values: {
        product_or_sector: 'Long-duration energy storage (>10 hours) for grid utilities',
        context_notes: 'US + EU markets. Reference IRA + REPowerEU policy tailwinds. Bottom-up by GWh deployed × $/kWh installed cost.',
      },
    },
    {
      label: 'Warehouse bin-picking robotics',
      values: {
        product_or_sector: 'Bin-picking and item-singulation robotics for ecommerce fulfillment',
        context_notes: 'Bottom-up: # of fulfillment centers globally × pick stations per FC × $ ARR per station.',
      },
    },
    {
      label: 'Drought-resilient row crops',
      values: {
        product_or_sector: 'Gene-edited drought-resilient row crops (corn, soy, wheat)',
        context_notes: 'Top-down: global seed market $63B 2024 × premium % for trait. Bottom-up: acres × premium $ per acre.',
      },
    },
    {
      label: 'Counter-UAS for defense',
      values: {
        product_or_sector: 'Counter-UAS systems for US/NATO forward operating bases',
        context_notes: 'Driven by DoD program of record budgets, FYDP funding. Both R&D + procurement lines.',
      },
    },
  ],

  'founder-background-summary': [
    {
      label: 'Aisha Rahman (Halcyon)',
      values: {
        founder_name: 'Aisha Rahman',
        material: 'LinkedIn: 2019-2023 Head of Applied AI, OpenAI. 2017-2019 Senior ML engineer, Google Brain. 2015-2017 PhD Stanford (CS, ML systems). 2011-2015 BS MIT (EECS). Speaks at NeurIPS / ICML, 12+ first-author papers on multi-agent orchestration. Press: 2024 Forbes 30u30, 2025 MIT TR35. Twitter: prolific on inference economics and agentic patterns.',
        context_notes: 'Evaluate founder-market fit for enterprise AI orchestration, ability to recruit senior GTM, and credibility with regulated enterprise buyers.',
      },
    },
    {
      label: 'Mira Okonkwo (Lumen)',
      values: {
        founder_name: 'Mira Okonkwo',
        material: 'LinkedIn: 2021-2024 Sr Research Scientist, CMU Robotics Institute (mobile manipulation lab). 2017-2021 Robotics engineer, Boston Dynamics (Spot perception team). 2015-2017 MS Robotics CMU. 2013-2017 BS Mechanical Engineering Howard University. Press: 2024 IEEE Spectrum profile on foundation models in manipulation. 22 patents in robotic grasping. No prior CEO experience.',
        context_notes: 'Assess technical-founder strengths, operator gaps, executive hiring needs and suitability for warehouse robotics commercialization.',
      },
    },
    {
      label: 'Mark Chen (BlueGrid)',
      values: {
        founder_name: 'Mark Chen',
        material: 'LinkedIn: 2019-2024 Director Engineering, Tesla Megapack program. 2016-2019 Senior battery engineer, Apple SPG. 2014-2016 Manufacturing engineer, Foxconn. 2012-2014 BS ME Stanford. 2014 left ME PhD at Berkeley ABD. Press: Quoted in WSJ on grid storage. Co-founder of two prior energy startups (one acquired by Tesla 2017, one wound down 2018).',
        context_notes: 'Focus on hardtech execution history, manufacturing scale-up credibility, prior founder lessons and utility customer access.',
      },
    },
    {
      label: 'Naomi Brand (NodeCipher)',
      values: {
        founder_name: 'Naomi Brand',
        material: 'LinkedIn: 2020-2024 Director Tailored Access Operations, NSA. 2014-2020 SOC lead, Mandiant. 2010-2014 BS CS Carnegie Mellon. Press: BlackHat keynote 2024 on lateral movement detection. Holds TS/SCI. Three patents in graph-based intrusion detection.',
        context_notes: 'Evaluate credibility with enterprise CISOs, transition from government to commercial GTM, and board-level communications maturity.',
      },
    },
    {
      label: 'Sven Holmberg (Kestrel)',
      values: {
        founder_name: 'Sven Holmberg',
        material: 'LinkedIn: 2022-2024 Director Counter-UAS Programs, Anduril. 2014-2022 USMC officer, multiple Iraq + Afghanistan deployments, MARSOC. 2010-2014 BS USNA, mechanical engineering. Holds active TS/SCI. Press: minimal. No prior founder experience.',
        context_notes: 'Assess government buyer access, dual-use founder-market fit, recruiting gaps and risk from limited prior CEO experience.',
      },
    },
  ],

  'thesis-fit-score': [
    {
      label: 'Halcyon AI vs Fund AI thesis',
      values: {
        deal_id: 'DEAL-2026-001',
        company_name: 'Halcyon AI',
        deal_summary: 'Series B, enterprise AI, $45M at $480M pre, $12.5M ARR 220% YoY, 320 logos, founder ex-OpenAI head of applied.',
        thesis_text: 'Fund AI I invests in enterprise AI infrastructure and applied AI orchestration for regulated industries. Sweet spot: Series A-B, $10-50M checks, $1-50M ARR with NDR > 120%, founder pedigree from frontier labs or top operators.',
        context_notes: 'Partner question: verify whether valuation is justified by regulated-enterprise wedge and whether model commoditization hurts the thesis.',
      },
    },
    {
      label: 'BlueGrid vs Fund Climate I',
      values: {
        deal_id: 'DEAL-2026-002',
        company_name: 'BlueGrid Energy',
        deal_summary: 'Series A, long-duration storage, $22M at $140M pre, pre-revenue with three utility pilots, founder ex-Tesla Megapack lead.',
        thesis_text: 'Fund Climate I invests in grid decarbonization tech: long-duration storage, grid software, distributed energy resources. Stage: Series A. Check: $10-25M. Founders with serious operator pedigree from Tesla/SunPower/Form Energy preferred.',
        context_notes: 'Investment team wants explicit scoring on stage fit, capital intensity, policy exposure and pilot-to-commercial conversion risk.',
      },
    },
    {
      label: 'Lumen vs Fund IV (generalist)',
      values: {
        deal_id: 'DEAL-2026-003',
        company_name: 'Lumen Robotics',
        deal_summary: 'Series A, warehouse robotics, $18M at $90M pre, $4.2M ARR growing 8x, Amazon+DHL paid pilots, CMU spinout.',
        thesis_text: 'Fund IV is a generalist Series A fund. Targets: deeptech with paying customers, founders with operator + research pedigree, $5-20M checks. Open to robotics, infra, vertical SaaS.',
        context_notes: 'Focus on whether hardware-heavy robotics still fits Fund IV risk appetite and whether customer concentration should reduce score.',
      },
    },
    {
      label: 'Volans Bio vs Fund AI (off-thesis)',
      values: {
        deal_id: 'DEAL-2026-004',
        company_name: 'Volans Bio',
        deal_summary: 'Series C, cardiometabolic biotech, $80M at $950M pre, Phase 2 readout Q4.',
        thesis_text: 'Fund AI I invests in enterprise AI infrastructure and applied AI orchestration for regulated industries.',
        context_notes: 'Use as an off-thesis control case; explain if any AI-enabled biology angle could partially rescue the fit.',
      },
    },
    {
      label: 'NodeCipher vs Fund Security I',
      values: {
        deal_id: 'DEAL-2026-005',
        company_name: 'NodeCipher Security',
        deal_summary: 'Series B, identity-graph cyber, $40M at $480M pre, $9.8M ARR NDR 142%, ex-NSA CEO.',
        thesis_text: 'Fund Security I invests in cyber + defense-tech dual-mandate. Stage: Series A-B. Check: $10-40M. Founders with .gov / IC pedigree preferred. NDR > 130% bar.',
        context_notes: 'Score commercial traction, cyber category fit, valuation pressure from Wiz comps and government-credential founder edge.',
      },
    },
  ],
};

// GET /api/ai/samples?feature=<verb>
router.get('/samples', (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    if (!feature) {
      return res.json({ features: Object.keys(SAMPLES) });
    }
    const samples = SAMPLES[feature];
    if (!samples) {
      return res.status(404).json({ error: `unknown feature: ${feature}` });
    }
    res.json({ feature, samples });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/ai/history?feature=<name>&limit=<n>
router.get('/history', async (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 200);
    let r;
    if (feature) {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results WHERE feature = $1 ORDER BY created_at DESC LIMIT $2',
        [feature, limit]
      );
    } else {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
    }
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 16 AI verb endpoints
// ──────────────────────────────────────────────────────────────

// POST /api/ai/ic-memo-draft
router.post('/ic-memo-draft', async (req, res) => {
  try {
    const body = req.body || {};
    const deal = {
      company_name:   body.company_name   || 'Sample Co',
      stage:          body.stage          || 'seed',
      sector:         body.sector         || 'general',
      round_size_usd: body.round_size_usd || 0,
      valuation_usd:  body.valuation_usd  || 0,
      notes:          body.notes          || '',
    };
    const result = await ai.icMemoDraft(deal, body.context || {});
    await record('ic-memo-draft', body, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/founder-call-summary
router.post('/founder-call-summary', async (req, res) => {
  try {
    const { transcript, context } = req.body || {};
    const result = await ai.founderCallSummary(transcript || '', context || {});
    await record('founder-call-summary', { has_transcript: !!transcript }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/comp-analysis
router.post('/comp-analysis', async (req, res) => {
  try {
    const { company_name, peers_text } = req.body || {};
    const company = { name: company_name || 'Sample Co' };
    const peers = (peers_text || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    const result = await ai.compAnalysis(company, peers);
    await record('comp-analysis', { company_name, peer_count: peers.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/valuation-band
router.post('/valuation-band', async (req, res) => {
  try {
    const { company_name, metrics_text } = req.body || {};
    const result = await ai.valuationBand({ name: company_name || 'Sample Co' }, { metrics: metrics_text || '' });
    await record('valuation-band', { company_name }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/executive-brief
router.post('/executive-brief', async (req, res) => {
  try {
    const [deals, memos, invs, exits, funds, metrics] = await Promise.all([
      pool.query("SELECT COUNT(*) FILTER (WHERE status='sourced') AS sourced, COUNT(*) FILTER (WHERE status='diligence') AS diligence, COUNT(*) FILTER (WHERE status='term_sheet') AS term_sheet, COUNT(*) FILTER (WHERE status='closed') AS closed, COUNT(*) AS total FROM deals"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='in_review') AS in_review, COUNT(*) FILTER (WHERE status='approved') AS approved, COUNT(*) AS total FROM ic_memos"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(amount_usd),0) AS amount FROM investments"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(value_usd),0) AS value FROM exits"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='investing') AS investing, COUNT(*) FILTER (WHERE status='harvesting') AS harvesting FROM funds"),
      pool.query("SELECT COUNT(*) AS total FROM portfolio_metrics"),
    ]);
    const snapshot = {
      deals: deals.rows[0],
      ic_memos: memos.rows[0],
      investments: invs.rows[0],
      exits: exits.rows[0],
      funds: funds.rows[0],
      portfolio_metrics: metrics.rows[0],
      ...(req.body?.notes ? { notes: req.body.notes } : {}),
    };
    const result = await ai.executiveBrief(snapshot);
    const out = { snapshot, brief: result };
    await record('executive-brief', { notes: req.body?.notes || null }, out);
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/lp-report-draft
router.post('/lp-report-draft', async (req, res) => {
  try {
    const { fund, period, notes } = req.body || {};
    let snapshot = { notes: notes || '' };
    try {
      if (fund) {
        const [invs, exitsR, lps] = await Promise.all([
          pool.query('SELECT * FROM investments WHERE fund_id = $1 ORDER BY closed_at DESC LIMIT 10', [fund]),
          pool.query("SELECT e.* FROM exits e ORDER BY closed_at DESC LIMIT 5"),
          pool.query('SELECT * FROM lp_reports WHERE fund_id = $1 ORDER BY id DESC LIMIT 1', [fund]),
        ]);
        snapshot.recent_investments = invs.rows;
        snapshot.recent_exits = exitsR.rows;
        snapshot.last_report = lps.rows[0] || null;
      }
    } catch (_) {}
    const result = await ai.lpReportDraft(fund || 'FUND-IV', period || '2026Q1', snapshot);
    await record('lp-report-draft', { fund, period }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/exit-scenario
router.post('/exit-scenario', async (req, res) => {
  try {
    const { company_name, context_notes } = req.body || {};
    const result = await ai.exitScenario({ name: company_name || 'Sample Co' }, { notes: context_notes || '' });
    await record('exit-scenario', { company_name }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/portfolio-flag
router.post('/portfolio-flag', async (req, res) => {
  try {
    let metrics = req.body?.metrics;
    if (!metrics) {
      const r = await pool.query('SELECT * FROM portfolio_metrics ORDER BY id ASC LIMIT 50');
      metrics = r.rows;
    }
    const result = await ai.portfolioFlag(metrics);
    await record('portfolio-flag', { metrics_count: metrics.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/follow-on-recommend
router.post('/follow-on-recommend', async (req, res) => {
  try {
    const { investment_id, notes } = req.body || {};
    let investment = req.body?.investment;
    if (!investment && investment_id) {
      try {
        const r = await pool.query('SELECT * FROM investments WHERE inv_id = $1', [investment_id]);
        if (r.rows.length) investment = r.rows[0];
      } catch (_) {}
    }
    investment = investment || { inv_id: investment_id || 'INV-UNKNOWN' };
    const result = await ai.followOnRecommend(investment, { notes: notes || '' });
    await record('follow-on-recommend', { investment_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/term-sheet-compare
router.post('/term-sheet-compare', async (req, res) => {
  try {
    const { versions, versions_text } = req.body || {};
    const list = Array.isArray(versions) ? versions : (versions_text ? [versions_text] : []);
    const result = await ai.termSheetCompare(list);
    await record('term-sheet-compare', { versions_count: list.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/intro-message-draft
router.post('/intro-message-draft', async (req, res) => {
  try {
    const { source, target, context_notes } = req.body || {};
    const result = await ai.introMessageDraft(source || '', target || '', { notes: context_notes || '' });
    await record('intro-message-draft', { source, target }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/market-mapping
router.post('/market-mapping', async (req, res) => {
  try {
    const { sector, focus_notes } = req.body || {};
    const result = await ai.marketMapping(sector || 'general', { notes: focus_notes || '' });
    await record('market-mapping', { sector }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/founder-redflag-extract
router.post('/founder-redflag-extract', async (req, res) => {
  try {
    const { founder_name, material } = req.body || {};
    const result = await ai.founderRedflagExtract(material || '', { founder: founder_name || '' });
    await record('founder-redflag-extract', { founder_name }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/cap-table-impact
router.post('/cap-table-impact', async (req, res) => {
  try {
    const { company_name, cap_table_text, proposed_round_text } = req.body || {};
    const result = await ai.capTableImpact(
      { company: company_name || '', cap_table: cap_table_text || '' },
      { proposed_round: proposed_round_text || '' }
    );
    await record('cap-table-impact', { company_name }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/distribution-waterfall
router.post('/distribution-waterfall', async (req, res) => {
  try {
    const { fund, exit_proceeds_usd, context_notes } = req.body || {};
    const result = await ai.distributionWaterfall(
      fund || 'FUND-IV',
      Number(exit_proceeds_usd) || 0,
      { notes: context_notes || '' }
    );
    await record('distribution-waterfall', { fund, exit_proceeds_usd }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/fund-strategy-brief
router.post('/fund-strategy-brief', async (req, res) => {
  try {
    const { fund_id, notes } = req.body || {};
    let fund = null;
    try {
      if (fund_id) {
        const r = await pool.query('SELECT * FROM funds WHERE fund_id = $1', [fund_id]);
        fund = r.rows[0] || null;
      }
    } catch (_) {}
    fund = fund || { fund_id: fund_id || 'FUND-UNKNOWN' };
    const result = await ai.fundStrategyBrief(fund, { notes: notes || '' });
    await record('fund-strategy-brief', { fund_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// Apply pass 7 — 5 new AI verbs (full backlog from _AUDIT_NOTE.md)
// ──────────────────────────────────────────────────────────────

// POST /api/ai/pitch-deck-extract
// LLM-only over caller-supplied deck text — no PDF/PPTX parsing here.
router.post('/pitch-deck-extract', async (req, res) => {
  try {
    const { deck_text, context_notes } = req.body || {};
    if (!deck_text || !String(deck_text).trim()) {
      return res.status(400).json({ error: 'deck_text is required (caller must convert PDF/PPTX → text first)' });
    }
    const result = await ai.pitchDeckExtract(String(deck_text), { notes: context_notes || '' });
    await record('pitch-deck-extract', { deck_text_len: String(deck_text).length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/dd-qa-generate
router.post('/dd-qa-generate', async (req, res) => {
  try {
    const { sector, stage, focus_notes } = req.body || {};
    const result = await ai.ddQaGenerate(sector || 'general', stage || 'seed', { notes: focus_notes || '' });
    await record('dd-qa-generate', { sector, stage }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/market-size-estimate
router.post('/market-size-estimate', async (req, res) => {
  try {
    const { product_or_sector, context_notes } = req.body || {};
    const result = await ai.marketSizeEstimate(product_or_sector || 'general', { notes: context_notes || '' });
    await record('market-size-estimate', { product_or_sector }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/founder-background-summary
router.post('/founder-background-summary', async (req, res) => {
  try {
    const { founder_name, material, context_notes } = req.body || {};
    const result = await ai.founderBackgroundSummary(
      founder_name || '',
      material || '',
      { notes: context_notes || '' }
    );
    await record('founder-background-summary', { founder_name }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai/thesis-fit-score
router.post('/thesis-fit-score', async (req, res) => {
  try {
    const { deal_id, company_name, deal_summary, thesis_text, context_notes } = req.body || {};
    let deal = { id: deal_id || '', company_name: company_name || '', summary: deal_summary || '' };
    try {
      if (deal_id) {
        const r = await pool.query('SELECT * FROM deals WHERE deal_id = $1', [deal_id]);
        if (r.rows.length) deal = { ...r.rows[0], summary: deal_summary || r.rows[0].notes || '' };
      }
    } catch (_) {}
    const result = await ai.thesisFitScore(deal, thesis_text || '', { notes: context_notes || '' });
    await record('thesis-fit-score', { deal_id, company_name }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
