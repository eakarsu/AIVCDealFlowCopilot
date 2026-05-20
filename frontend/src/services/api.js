const API_BASE =
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  'http://localhost:3073/api';

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

// Dashboard
export const getDashboardStats = () => request('/dashboard');

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/auth/me');

// AI endpoints — 16 VC verbs
export const aiIcMemoDraft           = (body) => request('/ai/ic-memo-draft',           { method: 'POST', body: JSON.stringify(body || {}) });
export const aiFounderCallSummary    = (body) => request('/ai/founder-call-summary',    { method: 'POST', body: JSON.stringify(body || {}) });
export const aiCompAnalysis          = (body) => request('/ai/comp-analysis',           { method: 'POST', body: JSON.stringify(body || {}) });
export const aiValuationBand         = (body) => request('/ai/valuation-band',          { method: 'POST', body: JSON.stringify(body || {}) });
export const aiExecutiveBrief        = (body) => request('/ai/executive-brief',         { method: 'POST', body: JSON.stringify(body || {}) });
export const aiLpReportDraft         = (body) => request('/ai/lp-report-draft',         { method: 'POST', body: JSON.stringify(body || {}) });
export const aiExitScenario          = (body) => request('/ai/exit-scenario',           { method: 'POST', body: JSON.stringify(body || {}) });
export const aiPortfolioFlag         = (body) => request('/ai/portfolio-flag',          { method: 'POST', body: JSON.stringify(body || {}) });
export const aiFollowOnRecommend     = (body) => request('/ai/follow-on-recommend',     { method: 'POST', body: JSON.stringify(body || {}) });
export const aiTermSheetCompare      = (body) => request('/ai/term-sheet-compare',      { method: 'POST', body: JSON.stringify(body || {}) });
export const aiIntroMessageDraft     = (body) => request('/ai/intro-message-draft',     { method: 'POST', body: JSON.stringify(body || {}) });
export const aiMarketMapping         = (body) => request('/ai/market-mapping',          { method: 'POST', body: JSON.stringify(body || {}) });
export const aiFounderRedflagExtract = (body) => request('/ai/founder-redflag-extract', { method: 'POST', body: JSON.stringify(body || {}) });
export const aiCapTableImpact        = (body) => request('/ai/cap-table-impact',        { method: 'POST', body: JSON.stringify(body || {}) });
export const aiDistributionWaterfall = (body) => request('/ai/distribution-waterfall',  { method: 'POST', body: JSON.stringify(body || {}) });
export const aiFundStrategyBrief     = (body) => request('/ai/fund-strategy-brief',     { method: 'POST', body: JSON.stringify(body || {}) });

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
