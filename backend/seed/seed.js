const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'vc_deal_flow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('[seed] resetting tables...');
    await client.query(`
      DROP TABLE IF EXISTS deals               CASCADE;
      DROP TABLE IF EXISTS founders            CASCADE;
      DROP TABLE IF EXISTS companies           CASCADE;
      DROP TABLE IF EXISTS funds               CASCADE;
      DROP TABLE IF EXISTS lp_reports          CASCADE;
      DROP TABLE IF EXISTS ic_memos            CASCADE;
      DROP TABLE IF EXISTS investments         CASCADE;
      DROP TABLE IF EXISTS follow_ons          CASCADE;
      DROP TABLE IF EXISTS portfolio_metrics   CASCADE;
      DROP TABLE IF EXISTS ai_results          CASCADE;

      DROP TABLE IF EXISTS users               CASCADE;
      DROP TABLE IF EXISTS notifications       CASCADE;
      DROP TABLE IF EXISTS attachments         CASCADE;
      DROP TABLE IF EXISTS webhooks            CASCADE;
      DROP TABLE IF EXISTS webhook_deliveries  CASCADE;

      DROP TABLE IF EXISTS board_meetings      CASCADE;
      DROP TABLE IF EXISTS term_sheets         CASCADE;
      DROP TABLE IF EXISTS capital_calls       CASCADE;
      DROP TABLE IF EXISTS distributions       CASCADE;
      DROP TABLE IF EXISTS advisors            CASCADE;
      DROP TABLE IF EXISTS intros              CASCADE;
      DROP TABLE IF EXISTS pipeline_notes      CASCADE;
      DROP TABLE IF EXISTS exits               CASCADE;
      DROP TABLE IF EXISTS audit_log           CASCADE;

      DROP TABLE IF EXISTS cap_tables          CASCADE;
      DROP TABLE IF EXISTS lp_comms_templates  CASCADE;
      DROP TABLE IF EXISTS kpi_ingest_sources  CASCADE;
      DROP TABLE IF EXISTS kpi_ingest_records  CASCADE;
    `);

    console.log('[seed] applying migrations...');
    const schema1 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_schema.sql'), 'utf8');
    await client.query(schema1);
    const schema2 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '002_schema.sql'), 'utf8');
    await client.query(schema2);
    const schema3 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '003_schema.sql'), 'utf8');
    await client.query(schema3);

    console.log('[seed] inserting deals...');
    const deals = [
      ['DEAL-2026-001', 'Lumen Robotics',         'series_a',    'robotics',         18000000, 'diligence'],
      ['DEAL-2026-002', 'NorthWind Health',       'seed',        'healthtech',        5000000, 'sourced'],
      ['DEAL-2026-003', 'Halcyon AI',             'series_b',    'enterprise_ai',    45000000, 'ic_review'],
      ['DEAL-2026-004', 'BlueGrid Energy',        'series_a',    'climate',          22000000, 'term_sheet'],
      ['DEAL-2026-005', 'Kestrel Defense',        'seed',        'defense_tech',      4500000, 'closed'],
      ['DEAL-2026-006', 'Volans Bio',             'series_c',    'biotech',          80000000, 'diligence'],
      ['DEAL-2026-007', 'Aperture Maps',          'pre_seed',    'geospatial',        1500000, 'sourced'],
      ['DEAL-2026-008', 'Cumulus Workloads',      'series_b',    'devops',           36000000, 'closed'],
      ['DEAL-2026-009', 'Ortus FinPay',           'series_a',    'fintech',          14000000, 'passed'],
      ['DEAL-2026-010', 'Heliograph Optics',      'seed',        'deep_tech',         6000000, 'ic_review'],
      ['DEAL-2026-011', 'Tributary Logistics',    'series_b',    'supply_chain',     52000000, 'term_sheet'],
      ['DEAL-2026-012', 'Pixel & Quill',          'pre_seed',    'consumer',          1200000, 'sourced'],
      ['DEAL-2026-013', 'StreamForge Data',       'series_a',    'enterprise_data',  20000000, 'diligence'],
      ['DEAL-2026-014', 'Veridian Crops',         'seed',        'agtech',            7500000, 'closed'],
      ['DEAL-2026-015', 'NodeCipher Security',    'series_b',    'cybersecurity',    40000000, 'ic_review'],
    ];
    for (const r of deals) {
      await client.query(
        `INSERT INTO deals (deal_id,company_name,stage,sector,round_size_usd,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        r
      );
    }

    console.log('[seed] inserting founders...');
    const founders = [
      ['FND-001', 'Mira Okonkwo',     'CMP-001', 'CEO',                'https://www.linkedin.com/in/mira-okonkwo',    'active'],
      ['FND-002', 'Daniel Park',      'CMP-002', 'CEO & co-founder',   'https://www.linkedin.com/in/daniel-park-md',  'active'],
      ['FND-003', 'Aisha Rahman',     'CMP-003', 'CEO',                'https://www.linkedin.com/in/aisha-rahman-ai', 'active'],
      ['FND-004', 'Lucas Vandermeer', 'CMP-004', 'CEO',                'https://www.linkedin.com/in/lucas-vandermeer','active'],
      ['FND-005', 'Sven Holmberg',    'CMP-005', 'CEO (USMC ret.)',    'https://www.linkedin.com/in/sven-holmberg',   'active'],
      ['FND-006', 'Yael Bensimon',    'CMP-006', 'CEO & PhD',          'https://www.linkedin.com/in/yael-bensimon',   'active'],
      ['FND-007', 'Priya Iyer',       'CMP-007', 'CEO',                'https://www.linkedin.com/in/priya-iyer-geo',  'active'],
      ['FND-008', 'Ben Tachibana',    'CMP-008', 'CTO & co-founder',   'https://www.linkedin.com/in/ben-tachibana',   'active'],
      ['FND-009', 'Camila Restrepo',  'CMP-009', 'CEO',                'https://www.linkedin.com/in/camila-restrepo', 'departed'],
      ['FND-010', 'Anders Lindqvist', 'CMP-010', 'CEO & physicist',    'https://www.linkedin.com/in/anders-lindqvist','active'],
      ['FND-011', 'Felicia Adekoya',  'CMP-011', 'CEO',                'https://www.linkedin.com/in/felicia-adekoya', 'active'],
      ['FND-012', 'Reza Karimi',      'CMP-012', 'Founder',            'https://www.linkedin.com/in/reza-karimi',     'active'],
      ['FND-013', 'Hiroko Sato',      'CMP-013', 'CEO',                'https://www.linkedin.com/in/hiroko-sato',     'active'],
      ['FND-014', 'Eduardo Cruz',     'CMP-014', 'CEO & agronomist',   'https://www.linkedin.com/in/eduardo-cruz-ag', 'active'],
      ['FND-015', 'Naomi Brand',      'CMP-015', 'CEO (ex-NSA)',       'https://www.linkedin.com/in/naomi-brand-sec', 'active'],
    ];
    for (const r of founders) {
      await client.query(
        `INSERT INTO founders (founder_id,name,company_id,role,linkedin,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        r
      );
    }

    console.log('[seed] inserting companies...');
    const companies = [
      ['CMP-001', 'Lumen Robotics',      'robotics',         'USA', 'Pittsburgh, PA',     'portfolio'],
      ['CMP-002', 'NorthWind Health',    'healthtech',       'USA', 'Boston, MA',         'tracked'],
      ['CMP-003', 'Halcyon AI',          'enterprise_ai',    'USA', 'San Francisco, CA',  'portfolio'],
      ['CMP-004', 'BlueGrid Energy',     'climate',          'USA', 'Austin, TX',         'tracked'],
      ['CMP-005', 'Kestrel Defense',     'defense_tech',     'USA', 'Arlington, VA',      'portfolio'],
      ['CMP-006', 'Volans Bio',          'biotech',          'CHE', 'Basel',              'portfolio'],
      ['CMP-007', 'Aperture Maps',       'geospatial',       'GBR', 'London',             'tracked'],
      ['CMP-008', 'Cumulus Workloads',   'devops',           'USA', 'Seattle, WA',        'portfolio'],
      ['CMP-009', 'Ortus FinPay',        'fintech',          'MEX', 'Mexico City',        'passed'],
      ['CMP-010', 'Heliograph Optics',   'deep_tech',        'NLD', 'Eindhoven',          'tracked'],
      ['CMP-011', 'Tributary Logistics', 'supply_chain',     'USA', 'Chicago, IL',        'tracked'],
      ['CMP-012', 'Pixel & Quill',       'consumer',         'GBR', 'Manchester',         'tracked'],
      ['CMP-013', 'StreamForge Data',    'enterprise_data',  'IRL', 'Dublin',             'tracked'],
      ['CMP-014', 'Veridian Crops',      'agtech',           'BRA', 'São Paulo',          'portfolio'],
      ['CMP-015', 'NodeCipher Security', 'cybersecurity',    'ISR', 'Tel Aviv',           'tracked'],
    ];
    for (const r of companies) {
      await client.query(
        `INSERT INTO companies (company_id,name,sector,country,hq,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        r
      );
    }

    console.log('[seed] inserting funds...');
    const funds = [
      ['FUND-I',     'Acme Ventures Fund I',         2017, 120000000,  2500000, 'harvesting'],
      ['FUND-II',    'Acme Ventures Fund II',        2019, 220000000,  5000000, 'harvesting'],
      ['FUND-III',   'Acme Ventures Fund III',       2021, 350000000,  9000000, 'investing'],
      ['FUND-IV',    'Acme Ventures Fund IV',        2024, 525000000, 12000000, 'investing'],
      ['FUND-SEED',  'Acme Seed Vehicle',            2023,  75000000,  1500000, 'investing'],
      ['FUND-OPP',   'Acme Opportunities Fund',      2025, 300000000,  6000000, 'investing'],
      ['FUND-CLI',   'Acme Climate Fund I',          2024, 180000000,  3500000, 'investing'],
      ['FUND-AI',    'Acme AI Fund I',               2025, 250000000,  5000000, 'investing'],
      ['FUND-BIO',   'Acme BioHealth Fund I',        2023, 200000000,  4000000, 'investing'],
      ['FUND-SEC',   'Acme Frontier Security I',     2024, 150000000,  3000000, 'investing'],
      ['FUND-GR',    'Acme Growth Fund I',           2022, 410000000,  8500000, 'harvesting'],
      ['FUND-EU',    'Acme Europe Fund I',           2025, 160000000,  3200000, 'investing'],
      ['FUND-INDIA', 'Acme India Fund I',            2024,  90000000,  1800000, 'investing'],
      ['FUND-LATAM', 'Acme LATAM Fund I',            2025,  60000000,  1200000, 'investing'],
      ['FUND-OG',    'Acme Founders Fund (legacy)',  2014,  40000000,   800000, 'wound_down'],
    ];
    for (const r of funds) {
      await client.query(
        `INSERT INTO funds (fund_id,name,vintage,size_usd,gp_commit_usd,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        r
      );
    }

    console.log('[seed] inserting lp_reports...');
    const lpReports = [
      ['LPR-2026-001', 'FUND-III',  '2026Q1', 412000000, 0.420, 'distributed'],
      ['LPR-2026-002', 'FUND-IV',   '2026Q1', 535000000, 0.080, 'distributed'],
      ['LPR-2026-003', 'FUND-II',   '2026Q1', 290000000, 1.250, 'distributed'],
      ['LPR-2026-004', 'FUND-I',    '2026Q1',  85000000, 2.140, 'final'],
      ['LPR-2026-005', 'FUND-OPP',  '2026Q1', 310000000, 0.040, 'draft'],
      ['LPR-2026-006', 'FUND-CLI',  '2026Q1', 198000000, 0.110, 'distributed'],
      ['LPR-2026-007', 'FUND-AI',   '2026Q1', 268000000, 0.020, 'draft'],
      ['LPR-2026-008', 'FUND-BIO',  '2026Q1', 215000000, 0.180, 'distributed'],
      ['LPR-2026-009', 'FUND-SEC',  '2026Q1', 162000000, 0.090, 'distributed'],
      ['LPR-2026-010', 'FUND-GR',   '2026Q1', 488000000, 0.870, 'distributed'],
      ['LPR-2026-011', 'FUND-EU',   '2026Q1', 168000000, 0.030, 'review'],
      ['LPR-2026-012', 'FUND-INDIA','2026Q1',  95000000, 0.060, 'distributed'],
      ['LPR-2026-013', 'FUND-LATAM','2026Q1',  63000000, 0.010, 'draft'],
      ['LPR-2026-014', 'FUND-SEED', '2026Q1',  82000000, 0.140, 'distributed'],
      ['LPR-2026-015', 'FUND-OG',   '2026Q1',   4000000, 4.180, 'final'],
    ];
    for (const r of lpReports) {
      await client.query(
        `INSERT INTO lp_reports (report_id,fund_id,period,nav_usd,dpi,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        r
      );
    }

    console.log('[seed] inserting ic_memos...');
    const memos = [
      ['MEMO-2026-001', 'DEAL-2026-001', 'Rachel Lin',     2, 'invest',         'in_review'],
      ['MEMO-2026-002', 'DEAL-2026-002', 'Daniel Klein',   1, 'follow_up',      'draft'],
      ['MEMO-2026-003', 'DEAL-2026-003', 'Sofia Hernandez',3, 'invest',         'approved'],
      ['MEMO-2026-004', 'DEAL-2026-004', 'Marcus Tan',     2, 'invest_with_conditions','in_review'],
      ['MEMO-2026-005', 'DEAL-2026-005', 'Naomi Ito',      1, 'invest',         'approved'],
      ['MEMO-2026-006', 'DEAL-2026-006', 'Rachel Lin',     2, 'invest',         'in_review'],
      ['MEMO-2026-007', 'DEAL-2026-007', 'Daniel Klein',   1, 'follow_up',      'draft'],
      ['MEMO-2026-008', 'DEAL-2026-008', 'Sofia Hernandez',1, 'invest',         'approved'],
      ['MEMO-2026-009', 'DEAL-2026-009', 'Marcus Tan',     2, 'pass',           'closed'],
      ['MEMO-2026-010', 'DEAL-2026-010', 'Naomi Ito',      1, 'invest',         'in_review'],
      ['MEMO-2026-011', 'DEAL-2026-011', 'Rachel Lin',     2, 'invest_with_conditions','in_review'],
      ['MEMO-2026-012', 'DEAL-2026-012', 'Daniel Klein',   1, 'follow_up',      'draft'],
      ['MEMO-2026-013', 'DEAL-2026-013', 'Sofia Hernandez',1, 'invest',         'draft'],
      ['MEMO-2026-014', 'DEAL-2026-014', 'Marcus Tan',     1, 'invest',         'approved'],
      ['MEMO-2026-015', 'DEAL-2026-015', 'Naomi Ito',      2, 'invest',         'in_review'],
    ];
    for (const r of memos) {
      await client.query(
        `INSERT INTO ic_memos (memo_id,deal_id,author,version,recommendation,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        r
      );
    }

    console.log('[seed] inserting investments...');
    const investments = [
      ['INV-2026-001', 'DEAL-2026-005', 'FUND-SEC',  4500000,  35000000,  '2026-02-10'],
      ['INV-2026-002', 'DEAL-2026-008', 'FUND-III', 12000000, 320000000,  '2026-03-22'],
      ['INV-2026-003', 'DEAL-2026-014', 'FUND-CLI',  3500000,  42000000,  '2026-04-01'],
      ['INV-2025-001', 'DEAL-2025-091', 'FUND-III',  9500000, 180000000,  '2025-11-14'],
      ['INV-2025-002', 'DEAL-2025-082', 'FUND-AI',  18000000, 540000000,  '2025-09-30'],
      ['INV-2025-003', 'DEAL-2025-077', 'FUND-CLI',  7000000,  95000000,  '2025-08-20'],
      ['INV-2024-001', 'DEAL-2024-145', 'FUND-II',   6000000,  72000000,  '2024-12-05'],
      ['INV-2024-002', 'DEAL-2024-122', 'FUND-IV',  22000000, 410000000,  '2024-10-18'],
      ['INV-2024-003', 'DEAL-2024-099', 'FUND-BIO', 14000000, 220000000,  '2024-07-09'],
      ['INV-2023-001', 'DEAL-2023-201', 'FUND-III', 11000000, 145000000,  '2023-11-30'],
      ['INV-2023-002', 'DEAL-2023-150', 'FUND-II',   8500000,  98000000,  '2023-08-22'],
      ['INV-2022-001', 'DEAL-2022-088', 'FUND-II',   5000000,  60000000,  '2022-09-15'],
      ['INV-2022-002', 'DEAL-2022-066', 'FUND-GR',  30000000, 850000000,  '2022-06-30'],
      ['INV-2021-001', 'DEAL-2021-040', 'FUND-I',    3500000,  28000000,  '2021-04-12'],
      ['INV-2020-001', 'DEAL-2020-018', 'FUND-I',    2500000,  18000000,  '2020-02-28'],
    ];
    for (const r of investments) {
      await client.query(
        `INSERT INTO investments (inv_id,deal_id,fund_id,amount_usd,valuation_usd,closed_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        r
      );
    }

    console.log('[seed] inserting follow_ons...');
    const followOns = [
      ['FO-001', 'INV-2024-002', 'series_c',  8000000, 6.4500, 'approved'],
      ['FO-002', 'INV-2024-003', 'series_c',  5500000, 4.2100, 'considering'],
      ['FO-003', 'INV-2025-002', 'series_b',  6000000, 8.1200, 'approved'],
      ['FO-004', 'INV-2025-003', 'series_b',  3500000, 5.6700, 'declined'],
      ['FO-005', 'INV-2023-001', 'series_c',  9000000, 3.4500, 'approved'],
      ['FO-006', 'INV-2022-002', 'series_d', 15000000, 2.8400, 'considering'],
      ['FO-007', 'INV-2022-001', 'series_b',  2500000, 7.2200, 'declined'],
      ['FO-008', 'INV-2024-001', 'series_b',  3000000, 6.1000, 'considering'],
      ['FO-009', 'INV-2025-001', 'series_b',  4500000, 4.9800, 'approved'],
      ['FO-010', 'INV-2026-002', 'series_c',  7500000, 5.6500, 'considering'],
      ['FO-011', 'INV-2021-001', 'series_b',  1500000, 9.5100, 'declined'],
      ['FO-012', 'INV-2023-002', 'series_c',  5000000, 4.1200, 'approved'],
      ['FO-013', 'INV-2020-001', 'series_b',   800000,11.2000, 'declined'],
      ['FO-014', 'INV-2024-002', 'series_d', 14000000, 5.8800, 'considering'],
      ['FO-015', 'INV-2026-003', 'series_a',  2000000, 8.0500, 'considering'],
    ];
    for (const r of followOns) {
      await client.query(
        `INSERT INTO follow_ons (fo_id,inv_id,round,amount_usd,ownership_pct,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        r
      );
    }

    console.log('[seed] inserting portfolio_metrics...');
    const metrics = [
      ['MET-001', 'CMP-001', 'ARR_usd',        4200000, '2026Q1', 'investor_update'],
      ['MET-002', 'CMP-003', 'ARR_usd',       12500000, '2026Q1', 'investor_update'],
      ['MET-003', 'CMP-005', 'ARR_usd',         950000, '2026Q1', 'board_deck'],
      ['MET-004', 'CMP-008', 'ARR_usd',       38000000, '2026Q1', 'investor_update'],
      ['MET-005', 'CMP-014', 'gross_margin',     0.480, '2026Q1', 'board_deck'],
      ['MET-006', 'CMP-003', 'logo_count',         320, '2026Q1', 'investor_update'],
      ['MET-007', 'CMP-008', 'logo_count',        2100, '2026Q1', 'investor_update'],
      ['MET-008', 'CMP-005', 'pipeline_usd',  18500000, '2026Q1', 'cro_report'],
      ['MET-009', 'CMP-001', 'gross_margin',     0.610, '2026Q1', 'board_deck'],
      ['MET-010', 'CMP-003', 'net_dollar_retention', 1.290, '2026Q1', 'investor_update'],
      ['MET-011', 'CMP-008', 'net_dollar_retention', 1.180, '2026Q1', 'investor_update'],
      ['MET-012', 'CMP-006', 'cash_runway_months',   18, '2026Q1', 'board_deck'],
      ['MET-013', 'CMP-005', 'cash_runway_months',   22, '2026Q1', 'board_deck'],
      ['MET-014', 'CMP-014', 'cash_runway_months',   11, '2026Q1', 'board_deck'],
      ['MET-015', 'CMP-001', 'headcount',           165, '2026Q1', 'hr_export'],
    ];
    for (const r of metrics) {
      await client.query(
        `INSERT INTO portfolio_metrics (metric_id,company_id,kpi,value,period,source) VALUES ($1,$2,$3,$4,$5,$6)`,
        r
      );
    }

    // ─────────────────────────────────────────────
    // RBAC users
    // ─────────────────────────────────────────────
    console.log('[seed] inserting users...');
    const users = [
      ['admin@vcdeal.io',   'admin123',   'Admin',   'admin'],
      ['partner@vcdeal.io', 'partner123', 'Partner', 'partner'],
      ['viewer@vcdeal.io',  'viewer123',  'Viewer',  'viewer'],
    ];
    for (const u of users) {
      await client.query(
        `INSERT INTO users (email,password,name,role) VALUES ($1,$2,$3,$4)`,
        u
      );
    }

    console.log('[seed] inserting notifications...');
    const notifications = [
      [1, 'IC memo approved',       'MEMO-2026-003 (Halcyon AI) approved by IC',           'info',     'ic_memos'],
      [1, 'Term sheet countersigned','BlueGrid Energy term sheet signed by founders',       'info',     'term_sheets'],
      [1, 'Capital call issued',     'FUND-IV capital call #7 issued — $42M due 2026-05-30','high',     'capital_calls'],
      [2, 'Portfolio flag triggered','Veridian Crops runway < 12 months',                   'critical', 'portfolio_metrics'],
      [2, 'New intro received',      'Stripe alumni intro to Halcyon AI CEO',               'info',     'intros'],
    ];
    for (const n of notifications) {
      await client.query(
        `INSERT INTO notifications (user_id,title,body,severity,source) VALUES ($1,$2,$3,$4,$5)`,
        n
      );
    }

    console.log('[seed] inserting webhooks...');
    const webhooks = [
      ['Slack #deal-flow',     'https://httpbin.org/post', 'sec_slack_2026',   'memo.approved,deal.closed', true],
      ['LP Portal Bridge',     'https://httpbin.org/post', 'sec_lpp_2026',     'lp_report.distributed',     true],
    ];
    for (const w of webhooks) {
      await client.query(
        `INSERT INTO webhooks (name,url,secret,events,active) VALUES ($1,$2,$3,$4,$5)`,
        w
      );
    }

    console.log('[seed] inserting board_meetings...');
    const meetings = [
      ['BRD-2026-001', 'CMP-001', '2026-02-12',  7, 'Q4 KPIs · Series B plan · hiring',         'https://drive.example/cmp001/bm-2026q1'],
      ['BRD-2026-002', 'CMP-003', '2026-02-19',  8, 'NDR review · enterprise pipeline · M&A',   'https://drive.example/cmp003/bm-2026q1'],
      ['BRD-2026-003', 'CMP-005', '2026-03-05',  6, 'DoD program update · burn · hiring',       'https://drive.example/cmp005/bm-2026q1'],
      ['BRD-2026-004', 'CMP-006', '2026-03-12',  9, 'Phase 2 readout · IND filing · cap raise', 'https://drive.example/cmp006/bm-2026q1'],
      ['BRD-2026-005', 'CMP-008', '2026-03-18',  7, 'NDR · enterprise contracts · cloud spend', 'https://drive.example/cmp008/bm-2026q1'],
      ['BRD-2026-006', 'CMP-014', '2026-03-25',  5, 'Brazil GTM · runway · cap raise plan',     'https://drive.example/cmp014/bm-2026q1'],
      ['BRD-2026-007', 'CMP-001', '2026-04-15',  7, 'Q1 close · hiring · pricing experiment',   'https://drive.example/cmp001/bm-2026q2'],
      ['BRD-2026-008', 'CMP-003', '2026-04-22',  8, 'Q1 close · NDR · enterprise security',     'https://drive.example/cmp003/bm-2026q2'],
      ['BRD-2026-009', 'CMP-005', '2026-04-30',  6, 'Pipeline · prototype · USAF rfp',          'https://drive.example/cmp005/bm-2026q2'],
      ['BRD-2026-010', 'CMP-008', '2026-05-07',  7, 'Annual planning · new SKU launch',         'https://drive.example/cmp008/bm-2026q2'],
      ['BRD-2026-011', 'CMP-014', '2026-05-09',  5, 'Runway · cap raise · partner deal',        'https://drive.example/cmp014/bm-2026q2'],
      ['BRD-2026-012', 'CMP-006', '2026-05-12',  9, 'Phase 2 dataset · IND prep',               'https://drive.example/cmp006/bm-2026q2'],
      ['BRD-2026-013', 'CMP-001', '2026-05-14',  7, 'Pricing GA · OEM partnerships',            'https://drive.example/cmp001/bm-may'],
      ['BRD-2026-014', 'CMP-003', '2026-05-15',  8, 'EMEA expansion · sales team',              'https://drive.example/cmp003/bm-may'],
      ['BRD-2026-015', 'CMP-008', '2026-05-16',  7, 'M&A pipeline · go-to-market refresh',      'https://drive.example/cmp008/bm-may'],
    ];
    for (const m of meetings) {
      await client.query(
        `INSERT INTO board_meetings (meeting_id,company_id,date,attendees_count,agenda,notes_url) VALUES ($1,$2,$3,$4,$5,$6)`,
        m
      );
    }

    console.log('[seed] inserting term_sheets...');
    const ts = [
      ['TS-2026-001', 'DEAL-2026-001', 2,  90000000, '1x non-participating pref, 20% option pool post-close, single-trigger acceleration',         'in_review'],
      ['TS-2026-002', 'DEAL-2026-004', 1, 140000000, '1x non-participating pref, 15% option pool, pro-rata rights, board seat for lead',           'sent'],
      ['TS-2026-003', 'DEAL-2026-005', 1,  35000000, '1x non-participating pref, 12% option pool, founder vesting 4yr/1yr cliff',                  'signed'],
      ['TS-2026-004', 'DEAL-2026-008', 1, 320000000, '1x non-participating pref, 8% option pool, 2x liquidation cap on participating warrant',     'signed'],
      ['TS-2026-005', 'DEAL-2026-011', 1, 410000000, '1x non-participating pref, 10% option pool, pro-rata, registration rights',                   'in_review'],
      ['TS-2026-006', 'DEAL-2026-003', 2, 720000000, '1x non-participating pref, 8% option pool, full ratchet anti-dilution',                       'sent'],
      ['TS-2026-007', 'DEAL-2026-015', 1, 480000000, '1x non-participating pref, 10% option pool, weighted-average anti-dilution',                  'in_review'],
      ['TS-2026-008', 'DEAL-2026-014', 1,  42000000, '1x non-participating pref, 15% option pool, founder vesting 4yr/1yr cliff',                   'signed'],
      ['TS-2026-009', 'DEAL-2026-006', 2, 950000000, '1x non-participating pref, 8% option pool, MFN clause, board observer for co-investors',      'sent'],
      ['TS-2026-010', 'DEAL-2026-013', 1, 180000000, '1x non-participating pref, 12% option pool, pro-rata rights',                                 'draft'],
      ['TS-2026-011', 'DEAL-2026-002', 1,  35000000, '1x non-participating pref, 18% option pool, pro-rata, founder vesting 4yr/1yr',               'draft'],
      ['TS-2026-012', 'DEAL-2026-010', 1,  50000000, '1x non-participating pref, 15% option pool, pro-rata, IP assignment confirmed',               'draft'],
      ['TS-2026-013', 'DEAL-2026-007', 1,  12000000, '1x non-participating pref, 18% option pool, pro-rata',                                        'draft'],
      ['TS-2026-014', 'DEAL-2026-012', 1,   8000000, 'SAFE: post-money MFN, 20% discount, no valuation cap',                                        'draft'],
      ['TS-2026-015', 'DEAL-2026-009', 2, 100000000, '1x participating pref, 8% option pool, 1.5x liquidation cap — declined by founders',         'withdrawn'],
    ];
    for (const t of ts) {
      await client.query(
        `INSERT INTO term_sheets (ts_id,deal_id,version,valuation_usd,terms,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        t
      );
    }

    console.log('[seed] inserting capital_calls...');
    const calls = [
      ['CALL-2026-001', 'FUND-III',  '2026Q1', 28000000, 'paid',      '2026-02-15'],
      ['CALL-2026-002', 'FUND-IV',   '2026Q1', 42000000, 'paid',      '2026-02-28'],
      ['CALL-2026-003', 'FUND-OPP',  '2026Q1', 24000000, 'paid',      '2026-03-10'],
      ['CALL-2026-004', 'FUND-CLI',  '2026Q1', 16000000, 'paid',      '2026-03-15'],
      ['CALL-2026-005', 'FUND-AI',   '2026Q1', 22000000, 'paid',      '2026-03-22'],
      ['CALL-2026-006', 'FUND-BIO',  '2026Q1', 18000000, 'paid',      '2026-03-30'],
      ['CALL-2026-007', 'FUND-SEC',  '2026Q1', 14000000, 'paid',      '2026-04-05'],
      ['CALL-2026-008', 'FUND-EU',   '2026Q1', 13500000, 'issued',    '2026-05-30'],
      ['CALL-2026-009', 'FUND-INDIA','2026Q1',  8000000, 'issued',    '2026-05-30'],
      ['CALL-2026-010', 'FUND-LATAM','2026Q1',  5000000, 'issued',    '2026-05-30'],
      ['CALL-2026-011', 'FUND-SEED', '2026Q1',  6500000, 'paid',      '2026-04-15'],
      ['CALL-2026-012', 'FUND-IV',   '2026Q2', 48000000, 'issued',    '2026-06-30'],
      ['CALL-2026-013', 'FUND-III',  '2026Q2', 24000000, 'issued',    '2026-06-30'],
      ['CALL-2026-014', 'FUND-OPP',  '2026Q2', 32000000, 'issued',    '2026-06-30'],
      ['CALL-2026-015', 'FUND-AI',   '2026Q2', 28000000, 'late',      '2026-04-30'],
    ];
    for (const c of calls) {
      await client.query(
        `INSERT INTO capital_calls (call_id,fund_id,period,amount_usd,status,due_date) VALUES ($1,$2,$3,$4,$5,$6)`,
        c
      );
    }

    console.log('[seed] inserting distributions...');
    const dists = [
      ['DIST-2026-001', 'FUND-I',    '2026Q1', 18000000, 'cash',       'completed'],
      ['DIST-2026-002', 'FUND-OG',   '2026Q1',  4000000, 'cash',       'completed'],
      ['DIST-2026-003', 'FUND-II',   '2026Q1', 26000000, 'cash',       'completed'],
      ['DIST-2026-004', 'FUND-GR',   '2026Q1', 38000000, 'in_kind',    'completed'],
      ['DIST-2026-005', 'FUND-I',    '2026Q1',  8000000, 'in_kind',    'completed'],
      ['DIST-2026-006', 'FUND-II',   '2026Q1', 12000000, 'in_kind',    'completed'],
      ['DIST-2026-007', 'FUND-GR',   '2026Q1', 22000000, 'cash',       'completed'],
      ['DIST-2026-008', 'FUND-BIO',  '2026Q1',  9500000, 'cash',       'completed'],
      ['DIST-2026-009', 'FUND-III',  '2026Q1', 15000000, 'cash',       'completed'],
      ['DIST-2026-010', 'FUND-CLI',  '2026Q1',  4500000, 'cash',       'completed'],
      ['DIST-2026-011', 'FUND-I',    '2026Q2', 12000000, 'cash',       'announced'],
      ['DIST-2026-012', 'FUND-II',   '2026Q2', 18500000, 'cash',       'announced'],
      ['DIST-2026-013', 'FUND-GR',   '2026Q2', 28000000, 'in_kind',    'announced'],
      ['DIST-2026-014', 'FUND-OG',   '2026Q2',  3000000, 'cash',       'announced'],
      ['DIST-2026-015', 'FUND-BIO',  '2026Q2',  7500000, 'cash',       'announced'],
    ];
    for (const d of dists) {
      await client.query(
        `INSERT INTO distributions (dist_id,fund_id,period,amount_usd,type,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        d
      );
    }

    console.log('[seed] inserting advisors...');
    const advisors = [
      ['ADV-001', 'Eleanor Whitfield', 'Whitfield Capital',         'Enterprise software GTM',          'FUND-III', 'active'],
      ['ADV-002', 'Dr. Kojo Mensah',   'Mensah BioStrategy',         'Biotech IND + Phase 2 strategy',   'FUND-BIO', 'active'],
      ['ADV-003', 'Hannah Ng',         'Ex-CFO Cloudera',            'Late-stage finance & IPO prep',    'FUND-GR',  'active'],
      ['ADV-004', 'Brigadier Gen. (Ret.) Tom Reyes', 'Reyes Defense Advisory', 'DoD program access', 'FUND-SEC', 'active'],
      ['ADV-005', 'Akira Sato',        'Sato Climate Partners',      'Climate / hard-tech commercialization', 'FUND-CLI', 'active'],
      ['ADV-006', 'Lila Borisov',      'Ex-VP Eng Stripe',           'Eng leadership coaching',          'FUND-IV',  'active'],
      ['ADV-007', 'Carlos Mendes',     'LATAM Growth Group',         'LATAM expansion',                  'FUND-LATAM','active'],
      ['ADV-008', 'Prof. Aparna Krish','IIT Bombay (entrepreneurship)','India ecosystem advisory',       'FUND-INDIA','active'],
      ['ADV-009', 'Markus Berger',     'Berger Pharma Consult',      'Regulatory / FDA',                 'FUND-BIO', 'active'],
      ['ADV-010', 'Sienna Patel',      'Patel Cyber Group',          'Cyber product / red teaming',      'FUND-SEC', 'active'],
      ['ADV-011', 'Jorge Salinas',     'Salinas Hardware Advisory',  'Deep tech supply chain',           'FUND-AI',  'inactive'],
      ['ADV-012', 'Elena Pavlou',      'Pavlou EU Capital',          'EU regulatory & GDPR',             'FUND-EU',  'active'],
      ['ADV-013', 'Ronald Cho',        'Cho M&A Partners',           'M&A / corp dev',                   'FUND-GR',  'active'],
      ['ADV-014', 'Dr. Yusuf Bah',     'Bah AgTech Advisors',        'AgTech / Latin America farming',   'FUND-LATAM','active'],
      ['ADV-015', 'Priya Menon',       'Menon Talent Group',         'Executive search',                 'FUND-IV',  'active'],
    ];
    for (const a of advisors) {
      await client.query(
        `INSERT INTO advisors (advisor_id,name,firm,expertise,fund_id,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        a
      );
    }

    console.log('[seed] inserting intros...');
    const intros = [
      ['INT-001', 'Ex-Stripe CTO',       'Halcyon AI CEO',          'CMP-003', 'completed', '2026-03-02 14:00+00'],
      ['INT-002', 'Sequoia partner',     'BlueGrid CEO',            'CMP-004', 'pending',   '2026-04-15 09:30+00'],
      ['INT-003', 'YC alum (founder)',   'Aperture Maps CEO',       'CMP-007', 'completed', '2026-04-12 16:00+00'],
      ['INT-004', 'A16Z principal',      'NodeCipher CEO',          'CMP-015', 'completed', '2026-04-22 11:00+00'],
      ['INT-005', 'Ex-Cloudera CFO',     'Cumulus CFO',             'CMP-008', 'completed', '2026-02-18 13:30+00'],
      ['INT-006', 'Cohere alum',         'StreamForge CEO',         'CMP-013', 'pending',   '2026-05-05 17:00+00'],
      ['INT-007', 'Brigadier Reyes',     'Kestrel CTO',             'CMP-005', 'completed', '2026-01-25 10:00+00'],
      ['INT-008', 'Roche scientist',     'Volans Bio CSO',          'CMP-006', 'completed', '2026-02-09 09:00+00'],
      ['INT-009', 'AgriPro VP',          'Veridian Crops CEO',      'CMP-014', 'completed', '2026-03-14 12:00+00'],
      ['INT-010', 'Sequoia India MD',    'Aperture Maps CEO',       'CMP-007', 'pending',   '2026-05-12 08:00+00'],
      ['INT-011', 'GV partner',          'Lumen Robotics CEO',      'CMP-001', 'completed', '2026-02-22 15:30+00'],
      ['INT-012', 'Ex-Square exec',      'Ortus FinPay CEO',        'CMP-009', 'declined',  '2026-01-19 18:00+00'],
      ['INT-013', 'Lockheed PM',         'Kestrel CEO',             'CMP-005', 'pending',   '2026-05-08 11:30+00'],
      ['INT-014', 'Pinterest alum',      'Pixel & Quill founder',   'CMP-012', 'completed', '2026-04-30 14:00+00'],
      ['INT-015', 'Ex-Goldman MD',       'Halcyon CFO candidate',   'CMP-003', 'pending',   '2026-05-14 09:00+00'],
    ];
    for (const i of intros) {
      await client.query(
        `INSERT INTO intros (intro_id,source,target,company_id,status,made_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        i
      );
    }

    console.log('[seed] inserting pipeline_notes...');
    const notes = [
      ['NOTE-001', 'DEAL-2026-001', 'Rachel Lin',     'Demo of new manipulation stack was extraordinary. Pricing model still fuzzy.', 'positive', '2026-05-10 14:00+00'],
      ['NOTE-002', 'DEAL-2026-002', 'Daniel Klein',   'Founder-market fit strong but CAC concerns. Wait for next cohort data.',       'neutral',  '2026-05-11 09:30+00'],
      ['NOTE-003', 'DEAL-2026-003', 'Sofia Hernandez','NDR 129% real and durable. Enterprise security questions remain.',             'positive', '2026-05-12 16:45+00'],
      ['NOTE-004', 'DEAL-2026-004', 'Marcus Tan',     'Tech risk on next-gen cell still material; co-lead conversation in flight.',  'neutral',  '2026-05-13 11:00+00'],
      ['NOTE-005', 'DEAL-2026-005', 'Naomi Ito',      'DoD pull is genuine; closing risk minimal.',                                   'positive', '2026-05-09 13:15+00'],
      ['NOTE-006', 'DEAL-2026-006', 'Rachel Lin',     'Pre-IND meeting feedback ambiguous. Watch Phase 2 readout.',                   'neutral',  '2026-05-08 18:00+00'],
      ['NOTE-007', 'DEAL-2026-007', 'Daniel Klein',   'Team is exceptional; market timing the question.',                             'neutral',  '2026-05-07 10:00+00'],
      ['NOTE-008', 'DEAL-2026-008', 'Sofia Hernandez','Anchor customer Goldman extended; renewals strong.',                           'positive', '2026-05-06 14:30+00'],
      ['NOTE-009', 'DEAL-2026-009', 'Marcus Tan',     'Founder dropped board observer ask. We are out.',                              'negative', '2026-05-05 12:00+00'],
      ['NOTE-010', 'DEAL-2026-010', 'Naomi Ito',      'IP is real; commercial path foggy. Need a CCO before IC.',                     'neutral',  '2026-05-04 09:30+00'],
      ['NOTE-011', 'DEAL-2026-011', 'Rachel Lin',     'Walmart pilot expanding; unit economics encouraging.',                         'positive', '2026-05-03 17:15+00'],
      ['NOTE-012', 'DEAL-2026-012', 'Daniel Klein',   'Founder very young, very smart. Slow play.',                                   'positive', '2026-05-02 13:00+00'],
      ['NOTE-013', 'DEAL-2026-013', 'Sofia Hernandez','Comp set is brutal; differentiation thin.',                                    'negative', '2026-05-01 11:00+00'],
      ['NOTE-014', 'DEAL-2026-014', 'Marcus Tan',     'Brazil ramp on track; expansion to Argentina credible.',                       'positive', '2026-04-30 15:30+00'],
      ['NOTE-015', 'DEAL-2026-015', 'Naomi Ito',      'Strong founder pedigree from NSA. Two reference calls outstanding.',           'positive', '2026-04-29 10:45+00'],
    ];
    for (const n of notes) {
      await client.query(
        `INSERT INTO pipeline_notes (note_id,deal_id,author,note,sentiment,ts) VALUES ($1,$2,$3,$4,$5,$6)`,
        n
      );
    }

    console.log('[seed] inserting exits...');
    const exitsRows = [
      ['EX-001', 'CMP-101', 'acquisition',  340000000,  8.10, '2026-01-22'],
      ['EX-002', 'CMP-102', 'ipo',         1820000000, 12.50, '2025-11-08'],
      ['EX-003', 'CMP-103', 'acquisition',   95000000,  3.40, '2025-09-15'],
      ['EX-004', 'CMP-104', 'secondary',     42000000,  2.10, '2026-02-28'],
      ['EX-005', 'CMP-105', 'acquisition',  520000000,  6.80, '2025-08-04'],
      ['EX-006', 'CMP-106', 'write_off',            0,  0.00, '2025-12-22'],
      ['EX-007', 'CMP-107', 'acquisition',  180000000,  4.20, '2025-06-30'],
      ['EX-008', 'CMP-108', 'ipo',          910000000,  9.80, '2026-03-14'],
      ['EX-009', 'CMP-109', 'secondary',     18000000,  1.40, '2026-04-05'],
      ['EX-010', 'CMP-110', 'acquisition',   72000000,  2.90, '2026-04-19'],
      ['EX-011', 'CMP-111', 'write_off',            0,  0.00, '2026-01-10'],
      ['EX-012', 'CMP-112', 'acquisition',  240000000,  5.10, '2026-02-08'],
      ['EX-013', 'CMP-113', 'ipo',          640000000,  7.40, '2025-10-22'],
      ['EX-014', 'CMP-114', 'acquisition',  110000000,  3.60, '2026-03-30'],
      ['EX-015', 'CMP-115', 'secondary',     58000000,  2.30, '2026-05-02'],
    ];
    for (const e of exitsRows) {
      await client.query(
        `INSERT INTO exits (exit_id,company_id,type,value_usd,multiple,closed_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        e
      );
    }

    console.log('[seed] inserting audit_log...');
    const audit = [
      ['AUD-001', 'admin@vcdeal.io',   'DEAL-2026-005',       'deal.closed',         'success', '2026-02-10 17:00+00'],
      ['AUD-002', 'partner@vcdeal.io', 'MEMO-2026-003',       'ic_memo.approved',    'success', '2026-04-22 14:30+00'],
      ['AUD-003', 'admin@vcdeal.io',   'CALL-2026-002',       'capital_call.issued', 'success', '2026-02-15 09:00+00'],
      ['AUD-004', 'admin@vcdeal.io',   'DIST-2026-001',       'distribution.sent',   'success', '2026-03-31 16:00+00'],
      ['AUD-005', 'partner@vcdeal.io', 'TS-2026-002',         'term_sheet.sent',     'success', '2026-04-30 12:15+00'],
      ['AUD-006', 'partner@vcdeal.io', 'DEAL-2026-009',       'deal.passed',         'success', '2026-05-05 12:00+00'],
      ['AUD-007', 'viewer@vcdeal.io',  'CMP-003',             'company.viewed',      'success', '2026-05-10 09:30+00'],
      ['AUD-008', 'admin@vcdeal.io',   'FUND-IV',             'fund.created',        'success', '2024-04-01 10:00+00'],
      ['AUD-009', 'partner@vcdeal.io', 'MEMO-2026-009',       'ic_memo.closed',      'success', '2026-05-05 12:30+00'],
      ['AUD-010', 'admin@vcdeal.io',   'LPR-2026-002',        'lp_report.distributed','success','2026-04-15 17:00+00'],
      ['AUD-011', 'admin@vcdeal.io',   'TS-2026-015',         'term_sheet.withdrawn','success', '2026-05-06 09:00+00'],
      ['AUD-012', 'partner@vcdeal.io', 'INV-2026-001',        'investment.recorded', 'success', '2026-02-10 17:15+00'],
      ['AUD-013', 'admin@vcdeal.io',   'EX-008',              'exit.recorded',       'success', '2026-03-14 18:00+00'],
      ['AUD-014', 'viewer@vcdeal.io',  'auth.login',          'login',               'success', '2026-05-12 08:45+00'],
      ['AUD-015', 'unknown@vcdeal.io', 'auth.login',          'login',               'failed',  '2026-05-12 08:50+00'],
    ];
    for (const a of audit) {
      await client.query(
        `INSERT INTO audit_log (entry_id,actor,target,action,result,ts) VALUES ($1,$2,$3,$4,$5,$6)`,
        a
      );
    }

    console.log('[seed] complete.');
  } catch (e) {
    console.error('[seed] error:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
