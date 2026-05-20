const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { authenticateToken } = require('./middleware/auth');
const pool = require('./config/database');
const { fireWebhook } = require('./services/webhooks');

async function onIcMemoCreated(row) {
  const rec = String(row.recommendation || '').toLowerCase();
  if (['invest', 'invest_with_conditions'].includes(rec)) {
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, severity, source)
         VALUES (NULL, $1, $2, $3, $4)`,
        [`New IC memo: ${row.memo_id}`,
         `Deal ${row.deal_id} — recommendation: ${row.recommendation}`.slice(0, 1000),
         'info',
         'ic_memos']
      );
    } catch (e) { console.warn('[notify] ic memo insert failed:', e.message); }
    fireWebhook(`memo.${rec}`, { row }).catch(() => {});
  }
}

async function onDealCreated(row) {
  if (String(row.status || '').toLowerCase() === 'closed') {
    fireWebhook('deal.closed', { row }).catch(() => {});
  }
}

const app = express();
const PORT = process.env.BACKEND_PORT || 3073;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3072,http://localhost:3073,http://localhost:3000')
  .split(',').map((o) => o.trim()).filter(Boolean);
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

app.listen(PORT, () => {
  console.log(`\nAI VC Deal Flow Copilot API running on http://localhost:${PORT}\n`);
});
