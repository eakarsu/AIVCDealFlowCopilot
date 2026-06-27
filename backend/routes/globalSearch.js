const express = require('express');
const pool = require('../config/database');

const router = express.Router();

const SEARCH_SOURCES = [
  {
    type: 'deal',
    table: 'deals',
    id: 'deal_id',
    title: 'company_name',
    subtitle: 'stage',
    columns: ['deal_id', 'company_name', 'sector', 'status', 'notes'],
  },
  {
    type: 'company',
    table: 'companies',
    id: 'company_id',
    title: 'name',
    subtitle: 'sector',
    columns: ['company_id', 'name', 'sector', 'country', 'hq', 'notes'],
  },
  {
    type: 'founder',
    table: 'founders',
    id: 'founder_id',
    title: 'name',
    subtitle: 'role',
    columns: ['founder_id', 'name', 'company_id', 'role', 'linkedin', 'notes'],
  },
  {
    type: 'document',
    table: 'data_room_documents',
    id: 'doc_id',
    title: 'title',
    subtitle: 'category',
    columns: ['doc_id', 'deal_id', 'company_id', 'title', 'category', 'owner', 'summary'],
  },
  {
    type: 'task',
    table: 'diligence_tasks',
    id: 'task_id',
    title: 'title',
    subtitle: 'workstream',
    columns: ['task_id', 'deal_id', 'workstream', 'title', 'owner', 'priority', 'status', 'notes'],
  },
  {
    type: 'lp_contact',
    table: 'lp_contacts',
    id: 'contact_id',
    title: 'lp_name',
    subtitle: 'contact_name',
    columns: ['contact_id', 'lp_name', 'contact_name', 'email', 'role', 'geography', 'notes'],
  },
  {
    type: 'portfolio_update',
    table: 'portfolio_updates',
    id: 'update_id',
    title: 'company_id',
    subtitle: 'period',
    columns: ['update_id', 'company_id', 'period', 'highlights', 'asks', 'status'],
  },
  {
    type: 'comment',
    table: 'collaboration_comments',
    id: 'comment_id',
    title: 'resource_id',
    subtitle: 'author',
    columns: ['comment_id', 'resource_type', 'resource_id', 'author', 'body', 'visibility', 'status'],
  },
];

router.get('/', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ query: q, results: [] });
    const pattern = `%${q.toLowerCase()}%`;
    const results = [];

    for (const source of SEARCH_SOURCES) {
      const where = source.columns.map((column) => `LOWER(COALESCE(${column}::text, '')) LIKE $1`).join(' OR ');
      const sql = `SELECT *, '${source.type}' AS result_type FROM ${source.table} WHERE ${where} ORDER BY id DESC LIMIT 10`;
      const r = await pool.query(sql, [pattern]);
      for (const row of r.rows) {
        results.push({
          type: source.type,
          id: row[source.id] || row.id,
          title: row[source.title] || row[source.id] || source.type,
          subtitle: row[source.subtitle] || '',
          row,
        });
      }
    }

    res.json({ query: q, results: results.slice(0, 75) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
