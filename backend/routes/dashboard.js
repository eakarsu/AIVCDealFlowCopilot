const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [
      deals, founders, companies, funds, lpReports, icMemos, investments, followOns,
      portfolioMetrics, boardMeetings, termSheets, capitalCalls, distributions,
      advisors, intros, pipelineNotes, exitsR, auditLog,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='diligence') AS diligence, COUNT(*) FILTER (WHERE status='closed') AS closed FROM deals"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM founders"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='portfolio') AS portfolio FROM companies"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='investing') AS investing, COALESCE(SUM(size_usd),0) AS total_size FROM funds"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='distributed') AS distributed FROM lp_reports"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='in_review') AS in_review, COUNT(*) FILTER (WHERE status='approved') AS approved FROM ic_memos"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(amount_usd),0) AS total_amount FROM investments"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='considering') AS considering FROM follow_ons"),
      pool.query("SELECT COUNT(*) AS total FROM portfolio_metrics"),
      pool.query("SELECT COUNT(*) AS total FROM board_meetings"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='signed') AS signed, COUNT(*) FILTER (WHERE status='sent') AS sent FROM term_sheets"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='issued') AS issued, COUNT(*) FILTER (WHERE status='late') AS late FROM capital_calls"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(amount_usd),0) AS total_amount FROM distributions"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM advisors"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='pending') AS pending, COUNT(*) FILTER (WHERE status='completed') AS completed FROM intros"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE sentiment='positive') AS positive, COUNT(*) FILTER (WHERE sentiment='negative') AS negative FROM pipeline_notes"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(value_usd),0) AS total_value FROM exits"),
      pool.query("SELECT COUNT(*) AS total FROM audit_log"),
    ]);
    res.json({
      deals: deals.rows[0],
      founders: founders.rows[0],
      companies: companies.rows[0],
      funds: funds.rows[0],
      lp_reports: lpReports.rows[0],
      ic_memos: icMemos.rows[0],
      investments: investments.rows[0],
      follow_ons: followOns.rows[0],
      portfolio_metrics: portfolioMetrics.rows[0],
      board_meetings: boardMeetings.rows[0],
      term_sheets: termSheets.rows[0],
      capital_calls: capitalCalls.rows[0],
      distributions: distributions.rows[0],
      advisors: advisors.rows[0],
      intros: intros.rows[0],
      pipeline_notes: pipelineNotes.rows[0],
      exits: exitsR.rows[0],
      audit_log: auditLog.rows[0],
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
