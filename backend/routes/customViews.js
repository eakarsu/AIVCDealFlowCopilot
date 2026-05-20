const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ---------------------------------------------------------------------------
// 1) PIPELINE KANBAN
//    Group deals by stage. Each card carries enough context to render.
// ---------------------------------------------------------------------------
router.get('/pipeline-kanban', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        deal_id,
        company_name,
        stage,
        sector,
        COALESCE(round_size_usd, 0) AS round_size_usd,
        status,
        created_at
      FROM deals
      ORDER BY stage NULLS LAST, round_size_usd DESC, deal_id
    `);

    // Order: standard VC deal lifecycle, but tolerate unknown stages by appending at end.
    const PREFERRED = ['pre_seed', 'seed', 'series_a', 'series_b', 'series_c'];
    const stageMap = new Map();
    for (const r of rows) {
      const stage = r.stage || 'unknown';
      if (!stageMap.has(stage)) stageMap.set(stage, []);
      stageMap.get(stage).push({
        deal_id:        r.deal_id,
        company_name:   r.company_name,
        stage,
        sector:         r.sector,
        round_size_usd: Number(r.round_size_usd) || 0,
        status:         r.status,
      });
    }
    const seen = new Set();
    const columns = [];
    for (const s of PREFERRED) {
      if (stageMap.has(s)) {
        columns.push({ stage: s, count: stageMap.get(s).length, deals: stageMap.get(s) });
        seen.add(s);
      }
    }
    for (const [s, deals] of stageMap.entries()) {
      if (seen.has(s)) continue;
      columns.push({ stage: s, count: deals.length, deals });
    }
    res.json({ columns, total: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
// 2) PORTFOLIO BUBBLE
//    For each investment join the latest follow-on (for ownership_pct
//    and last_round_amt). last_valuation comes from the investment row.
// ---------------------------------------------------------------------------
router.get('/portfolio-bubble', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      WITH latest_fo AS (
        SELECT DISTINCT ON (inv_id)
          inv_id,
          amount_usd     AS last_round_amt,
          ownership_pct,
          round          AS last_round
        FROM follow_ons
        ORDER BY inv_id, created_at DESC, id DESC
      )
      SELECT
        i.inv_id,
        i.deal_id,
        i.fund_id,
        COALESCE(i.amount_usd, 0)    AS amount_usd,
        COALESCE(i.valuation_usd, 0) AS last_valuation,
        COALESCE(d.company_name, i.deal_id) AS company_name,
        COALESCE(d.sector, 'unknown')       AS sector,
        COALESCE(lf.ownership_pct, 0)       AS ownership_pct,
        COALESCE(lf.last_round_amt, i.amount_usd, 0) AS last_round_amt,
        lf.last_round
      FROM investments i
      LEFT JOIN deals     d  ON d.deal_id = i.deal_id
      LEFT JOIN latest_fo lf ON lf.inv_id = i.inv_id
      ORDER BY i.valuation_usd DESC NULLS LAST
    `);

    const points = rows.map((r) => ({
      inv_id:         r.inv_id,
      company_name:   r.company_name,
      sector:         r.sector,
      fund_id:        r.fund_id,
      last_valuation: Number(r.last_valuation) || 0,
      ownership_pct:  Number(r.ownership_pct)  || 0,
      last_round_amt: Number(r.last_round_amt) || 0,
      last_round:     r.last_round,
    }));

    // Build sector palette
    const PALETTE = [
      '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#a78bfa',
      '#22c55e', '#0ea5e9', '#fb7185', '#facc15', '#14b8a6',
      '#f472b6', '#dc2626', '#34d399', '#7dd3fc', '#8b5cf6',
    ];
    const sectors = [...new Set(points.map((p) => p.sector))].sort();
    const palette = Object.fromEntries(sectors.map((s, i) => [s, PALETTE[i % PALETTE.length]]));

    res.json({ points, sectors, palette, count: points.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
// 3) FUND TVPI TREND
//    Aggregate over time using lp_reports.period.
//    DPI: avg dpi across funds for the period.
//    RVPI: sum(nav) / sum(called capital ~ capital_calls.amount_usd <= period end)
//    TVPI = DPI + RVPI.
//    Single-fund filter supported via ?fund_id=
// ---------------------------------------------------------------------------
router.get('/fund-tvpi-trend', async (req, res) => {
  try {
    const fundId = (req.query.fund_id || '').toString().trim();
    const args = [];
    let where = '';
    if (fundId) {
      args.push(fundId);
      where = `WHERE fund_id = $1`;
    }

    const lpRes = await pool.query(`
      SELECT period, fund_id,
             COALESCE(dpi, 0)::float    AS dpi,
             COALESCE(nav_usd, 0)::float AS nav_usd
      FROM lp_reports
      ${where}
      ORDER BY period
    `, args);

    const callRes = await pool.query(`
      SELECT period, fund_id, COALESCE(SUM(amount_usd),0)::float AS called
      FROM capital_calls
      ${where}
      GROUP BY period, fund_id
    `, args);

    const distRes = await pool.query(`
      SELECT period, fund_id, COALESCE(SUM(amount_usd),0)::float AS distributed
      FROM distributions
      ${where}
      GROUP BY period, fund_id
    `, args);

    // Build cumulative-called by period (per fund), then aggregate over funds in each period.
    const periods = [...new Set([
      ...lpRes.rows.map((r) => r.period),
      ...callRes.rows.map((r) => r.period),
      ...distRes.rows.map((r) => r.period),
    ])].filter(Boolean).sort();

    const callsByFundPeriod = new Map();
    for (const r of callRes.rows) callsByFundPeriod.set(`${r.fund_id}|${r.period}`, r.called);
    const distByFundPeriod  = new Map();
    for (const r of distRes.rows) distByFundPeriod.set(`${r.fund_id}|${r.period}`, r.distributed);

    // All fund ids in this slice
    const funds = [...new Set([
      ...lpRes.rows.map((r) => r.fund_id),
      ...callRes.rows.map((r) => r.fund_id),
      ...distRes.rows.map((r) => r.fund_id),
    ])].filter(Boolean);

    // Cumulative running totals per fund up to & including each period.
    const cumCalled = {};
    const cumDist   = {};
    for (const f of funds) { cumCalled[f] = 0; cumDist[f] = 0; }

    const series = [];
    for (const p of periods) {
      let sumNav = 0;
      let sumCalled = 0;
      let sumDist = 0;
      // For DPI we will report average of fund-level DPI for the period.
      const fundDpis = [];

      for (const f of funds) {
        cumCalled[f] += callsByFundPeriod.get(`${f}|${p}`) || 0;
        cumDist[f]   += distByFundPeriod.get(`${f}|${p}`) || 0;
      }
      for (const r of lpRes.rows.filter((x) => x.period === p)) {
        sumNav += r.nav_usd;
        fundDpis.push(r.dpi);
      }
      for (const f of funds) {
        sumCalled += cumCalled[f];
        sumDist   += cumDist[f];
      }

      const dpi  = fundDpis.length
        ? fundDpis.reduce((a, b) => a + b, 0) / fundDpis.length
        : (sumCalled > 0 ? sumDist / sumCalled : 0);
      const rvpi = sumCalled > 0 ? sumNav / sumCalled : 0;
      const tvpi = dpi + rvpi;

      series.push({
        period: p,
        dpi:    Number(dpi.toFixed(3)),
        rvpi:   Number(rvpi.toFixed(3)),
        tvpi:   Number(tvpi.toFixed(3)),
      });
    }

    res.json({ series, fund_id: fundId || null, count: series.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
// 4) SECTOR DONUT
//    Investments grouped by sector (taken from the related deal).
// ---------------------------------------------------------------------------
router.get('/sector-donut', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COALESCE(d.sector, 'unknown') AS sector,
        COUNT(i.id)::int              AS count,
        COALESCE(SUM(i.amount_usd),0)::bigint AS total_amount
      FROM investments i
      LEFT JOIN deals d ON d.deal_id = i.deal_id
      GROUP BY COALESCE(d.sector, 'unknown')
      ORDER BY count DESC, sector
    `);

    const PALETTE = [
      '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#a78bfa',
      '#22c55e', '#0ea5e9', '#fb7185', '#facc15', '#14b8a6',
      '#f472b6', '#dc2626', '#34d399', '#7dd3fc', '#8b5cf6',
    ];
    const slices = rows.map((r, i) => ({
      sector:       r.sector,
      count:        Number(r.count) || 0,
      total_amount: Number(r.total_amount) || 0,
      color:        PALETTE[i % PALETTE.length],
    }));
    const total = slices.reduce((a, b) => a + b.count, 0);
    res.json({ slices, total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
