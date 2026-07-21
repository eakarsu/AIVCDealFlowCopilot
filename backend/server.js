const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { authenticateToken } = require('./middleware/auth');
const pool = require('./config/database');

const app = express();
const PORT = Number(process.env.BACKEND_PORT);
if (!Number.isInteger(PORT) || PORT < 1) throw new Error('BACKEND_PORT is required');

async function verifySchema() {
  const result = await pool.query("SELECT to_regclass('public.vc_deal_reviews') AS workflow, to_regclass('public.vc_workflow_audit') AS audit");
  if (!result.rows[0].workflow || !result.rows[0].audit) throw new Error('database migrations are pending; run npm run migrate');
}

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map((o) => o.trim()).filter(Boolean);
if (!allowedOrigins.length) throw new Error('ALLOWED_ORIGINS is required');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth (public)
app.use('/api/auth', require('./routes/auth'));

// Everything below this line requires a Bearer token.
app.use('/api', authenticateToken);
app.use('/api/deal-workflow', require('./routes/dealWorkflow'));
app.use(/^\/api\/(?:ai(?:\/|$)|gap-|integrations?(?:\/|$)|webhooks?(?:\/|$))/, (_req, res) => res.status(503).json({ error: 'legacy generated/direct-provider endpoint quarantined; use the reviewed deal workflow delivery ledger' }));

// 18 CRUD routes — all use _crudFactory which embeds RBAC + bulk-import + attachments
app.use('/api/deals',              require('./routes/deals'));
app.use('/api/founders',           require('./routes/founders'));
app.use('/api/companies',          require('./routes/companies'));
app.use('/api/funds',              require('./routes/funds'));
app.use('/api/lp-reports',         require('./routes/lpReports'));
app.use('/api/ic-memos',           require('./routes/icMemos'));
app.use('/api/investments',        require('./routes/investments'));
app.use('/api/follow-ons',         require('./routes/followOns'));
app.use('/api/portfolio-metrics',  require('./routes/portfolioMetrics'));
app.use('/api/board-meetings',     require('./routes/boardMeetings'));
app.use('/api/term-sheets',        require('./routes/termSheets'));
app.use('/api/capital-calls',      require('./routes/capitalCalls'));
app.use('/api/distributions',      require('./routes/distributions'));
app.use('/api/advisors',           require('./routes/advisors'));
app.use('/api/intros',             require('./routes/intros'));
app.use('/api/pipeline-notes',     require('./routes/pipelineNotes'));
app.use('/api/exits',              require('./routes/exits'));
app.use('/api/audit-log',          require('./routes/auditLog'));

// AI routes (16 sub-endpoints + history under /api/ai)
app.use('/api/ai', require('./routes/ai'));

// Cross-cutting
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/attachments',   require('./routes/attachments'));
app.use('/api/webhooks',      require('./routes/webhooks'));

// Dashboard stats
app.use('/api/dashboard', require('./routes/dashboard'));

// Custom analytics views (kanban + portfolio bubble + TVPI + sector donut)
app.use('/api/custom-views', require('./routes/customViews'));

// Apply pass 7 — backlog CRUD entities (cap tables, LP comms templates,
// KPI ingest sources + records). Mounted before app.listen to satisfy the
// "before 404 handler" placement requirement.
app.use('/api/cap-tables',           require('./routes/capTables'));
app.use('/api/lp-comms-templates',   require('./routes/lpCommsTemplates'));
app.use('/api/kpi-ingest-sources',   require('./routes/kpiIngestSources'));
app.use('/api/kpi-ingest-records',   require('./routes/kpiIngestRecords'));

// Feature expansion — data room, diligence, LP CRM, fund operations,
// collaboration, access control, and global search.
app.use('/api/data-room-documents',      require('./routes/dataRoomDocuments'));
app.use('/api/diligence-tasks',          require('./routes/diligenceTasks'));
app.use('/api/lp-contacts',              require('./routes/lpContacts'));
app.use('/api/fundraising-pipeline',     require('./routes/fundraisingPipeline'));
app.use('/api/portfolio-updates',        require('./routes/portfolioUpdates'));
app.use('/api/fund-expenses',            require('./routes/fundExpenses'));
app.use('/api/reserve-plans',            require('./routes/reservePlans'));
app.use('/api/collaboration-comments',   require('./routes/collaborationComments'));
app.use('/api/access-rules',             require('./routes/accessRules'));
app.use('/api/saved-searches',           require('./routes/savedSearches'));
app.use('/api/global-search',            require('./routes/globalSearch'));

verifySchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\nAI VC Deal Flow Copilot API running on http://localhost:${PORT}\n`);
    });
  })
  .catch((error) => {
    console.error('[startup] schema readiness failed:', error.message);
    process.exit(1);
  });
