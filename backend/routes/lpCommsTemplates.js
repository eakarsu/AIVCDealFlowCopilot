// LP comms templates — reusable letter / notice templates with
// {{handlebars-style}} variable substitution support.
// Schema: backend/migrations/003_schema.sql · lp_comms_templates
//
// Extends the standard CRUD with one extra endpoint:
//   POST /api/lp-comms-templates/:id/render { variables: {...} }
//     → returns the body + subject with {{var}} tokens replaced.

const express = require('express');
const pool = require('../config/database');
const buildCrud = require('./_crudFactory');

const baseRouter = buildCrud({
  table: 'lp_comms_templates',
  fields: [
    'template_id',
    'name',
    'category',
    'subject',
    'body',
    'variables',
    'fund_id',
    'status',
  ],
});

function substitute(text, variables) {
  if (text == null) return '';
  const vars = variables && typeof variables === 'object' ? variables : {};
  return String(text).replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) {
      const v = vars[key];
      return v == null ? '' : String(v);
    }
    return `{{${key}}}`;
  });
}

const router = express.Router();

// POST /api/lp-comms-templates/:id/render
// Body: { variables: { fund: "FUND-IV", period: "2026Q1", ... } }
router.post('/:id/render', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM lp_comms_templates WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    const tmpl = r.rows[0];
    const variables = (req.body && req.body.variables) || {};
    const rendered_subject = substitute(tmpl.subject, variables);
    const rendered_body    = substitute(tmpl.body, variables);
    // Surface any tokens that were left un-substituted.
    const unresolved = [];
    const scan = (s) => {
      const m = String(s).match(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g) || [];
      for (const tok of m) unresolved.push(tok.replace(/[{}\s]/g, ''));
    };
    scan(rendered_subject); scan(rendered_body);
    res.json({
      template_id: tmpl.template_id,
      name: tmpl.name,
      category: tmpl.category,
      fund_id: tmpl.fund_id,
      rendered_subject,
      rendered_body,
      unresolved_variables: Array.from(new Set(unresolved)),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.use(baseRouter);

module.exports = router;
