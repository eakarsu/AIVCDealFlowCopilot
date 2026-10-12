const API_BASE =
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  process.env.REACT_APP_API_URL || '/api';

export { API_BASE };

const TOKEN_KEY = 'vcdf_token';
const USER_KEY  = 'vcdf_user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
export function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch (_) {}
}
export function logout() {
  setToken(null);
  setStoredUser(null);
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
}

// Role helpers
export function getRole() {
  return (getStoredUser()?.role || 'viewer').toLowerCase();
}
export function canWrite() {
  return ['admin', 'partner'].includes(getRole());
}
export function isCommander() {
  return getRole() === 'admin';
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  } catch (e) {
    throw new Error(`Network error: ${e.message}`);
  }

  if (res.status === 401) {
    if (!url.startsWith('/auth/login')) {
      logout();
      throw new Error('Session expired');
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Generic CRUD factory
function crud(base) {
  return {
    list:   ()       => request(`/${base}`),
    get:    (id)     => request(`/${base}/${id}`),
    create: (data)   => request(`/${base}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, d)  => request(`/${base}/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id)     => request(`/${base}/${id}`, { method: 'DELETE' }),
    bulkImport: (csv) => request(`/${base}/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv,
    }),
    listAttachments: (id) => request(`/${base}/${id}/attachments`),
    uploadAttachment: async (id, file) => {
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/${base}/${id}/attachments`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      return data;
    },
  };
}

// Apply pass 7 — backlog CRUD entities (cap-tables, LP comms templates,
// KPI ingest sources + records).
export const capTablesApi         = crud('cap-tables');
export const lpCommsTemplatesApi  = {
  ...crud('lp-comms-templates'),
  render: (id, variables) => request(`/lp-comms-templates/${id}/render`, {
    method: 'POST',
    body: JSON.stringify({ variables: variables || {} }),
  }),
};
export const kpiIngestSourcesApi  = {
  ...crud('kpi-ingest-sources'),
  markRun: (id) => request(`/kpi-ingest-sources/${id}/mark-run`, { method: 'POST' }),
};
export const kpiIngestRecordsApi  = crud('kpi-ingest-records');

// 18 VC CRUD entities
export const dealsApi             = crud('deals');
export const foundersApi          = crud('founders');
export const companiesApi         = crud('companies');
export const fundsApi             = crud('funds');
export const lpReportsApi         = crud('lp-reports');
export const icMemosApi           = crud('ic-memos');
export const investmentsApi       = crud('investments');
export const followOnsApi         = crud('follow-ons');
export const portfolioMetricsApi  = crud('portfolio-metrics');
export const boardMeetingsApi     = crud('board-meetings');
export const termSheetsApi        = crud('term-sheets');
export const capitalCallsApi      = crud('capital-calls');
export const distributionsApi     = crud('distributions');
export const advisorsApi          = crud('advisors');
export const introsApi            = crud('intros');
export const pipelineNotesApi     = crud('pipeline-notes');
export const exitsApi             = crud('exits');
export const auditLogApi          = crud('audit-log');
export const dataRoomDocumentsApi = crud('data-room-documents');
export const diligenceTasksApi    = crud('diligence-tasks');
export const lpContactsApi        = crud('lp-contacts');
export const fundraisingPipelineApi = crud('fundraising-pipeline');
export const portfolioUpdatesApi  = crud('portfolio-updates');
export const fundExpensesApi      = crud('fund-expenses');
export const reservePlansApi      = crud('reserve-plans');
export const collaborationCommentsApi = crud('collaboration-comments');
export const accessRulesApi       = crud('access-rules');
export const savedSearchesApi     = crud('saved-searches');
export const globalSearch = (q) => request(`/global-search?${new URLSearchParams({ q: q || '' }).toString()}`);

// Dashboard
export const getDashboardStats = () => request('/dashboard');

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/auth/me');

// AI endpoints — 16 VC verbs
export const aiIcMemoDraft           = (body, options = {}) => request('/ai/ic-memo-draft',           { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiFounderCallSummary    = (body, options = {}) => request('/ai/founder-call-summary',    { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiCompAnalysis          = (body, options = {}) => request('/ai/comp-analysis',           { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiValuationBand         = (body, options = {}) => request('/ai/valuation-band',          { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiExecutiveBrief        = (body, options = {}) => request('/ai/executive-brief',         { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiLpReportDraft         = (body, options = {}) => request('/ai/lp-report-draft',         { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiExitScenario          = (body, options = {}) => request('/ai/exit-scenario',           { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiPortfolioFlag         = (body, options = {}) => request('/ai/portfolio-flag',          { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiFollowOnRecommend     = (body, options = {}) => request('/ai/follow-on-recommend',     { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiTermSheetCompare      = (body, options = {}) => request('/ai/term-sheet-compare',      { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiIntroMessageDraft     = (body, options = {}) => request('/ai/intro-message-draft',     { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiMarketMapping         = (body, options = {}) => request('/ai/market-mapping',          { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiFounderRedflagExtract = (body, options = {}) => request('/ai/founder-redflag-extract', { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiCapTableImpact        = (body, options = {}) => request('/ai/cap-table-impact',        { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiDistributionWaterfall = (body, options = {}) => request('/ai/distribution-waterfall',  { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiFundStrategyBrief     = (body, options = {}) => request('/ai/fund-strategy-brief',     { ...options, method: 'POST', body: JSON.stringify(body || {}) });

// Apply pass 7 — 5 new AI verbs.
export const aiPitchDeckExtract        = (body, options = {}) => request('/ai/pitch-deck-extract',         { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiDdQaGenerate            = (body, options = {}) => request('/ai/dd-qa-generate',             { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiMarketSizeEstimate      = (body, options = {}) => request('/ai/market-size-estimate',       { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiFounderBackgroundSummary = (body, options = {}) => request('/ai/founder-background-summary',{ ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiThesisFitScore          = (body, options = {}) => request('/ai/thesis-fit-score',           { ...options, method: 'POST', body: JSON.stringify(body || {}) });

// AI history
export const getAIHistory = (feature, limit = 25) => {
  const qs = new URLSearchParams({
    ...(feature ? { feature } : {}),
    limit: String(limit),
  }).toString();
  return request(`/ai/history?${qs}`);
};

// AI sample fills
export const getAISamples = (feature) => {
  const qs = new URLSearchParams({ feature: feature || '' }).toString();
  return request(`/ai/samples?${qs}`);
};

// Notifications
export const getNotifications       = () => request('/notifications');
export const getUnreadNotifications = () => request('/notifications/unread');
export const markNotificationRead   = (id) => request(`/notifications/${id}/read`, { method: 'POST' });
export const markAllNotificationsRead = () => request('/notifications/mark-all-read', { method: 'POST' });

// Webhooks
export const webhooksApi = {
  list:    ()         => request('/webhooks'),
  create:  (d)        => request('/webhooks',          { method: 'POST', body: JSON.stringify(d) }),
  update:  (id, d)    => request(`/webhooks/${id}`,    { method: 'PUT',  body: JSON.stringify(d) }),
  remove:  (id)       => request(`/webhooks/${id}`,    { method: 'DELETE' }),
  test:    (event, payload) => request('/webhooks/test', {
    method: 'POST',
    body: JSON.stringify({ event, payload }),
  }),
  deliveries: (id)    => request(`/webhooks/${id}/deliveries`),
};

export const aiGovernedBrief = (body, options = {}) => request("/deal-workflow/ai-brief", { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const getGovernedBriefHistory = (options = {}) => request("/deal-workflow/ai-brief", options);
