/**
 * api-client.js  —  AgriFlow Frontend API Client
 * ================================================
 * Thin wrapper around fetch() for all backend calls.
 * Handles JWT token storage, SSE real-time updates,
 * connection status badge, and offline fallback.
 *
 * Add to every HTML page in <head> AFTER agri-db.js:
 *   <script src="api-client.js"></script>
 *
 * Add  data-backend-status=""  to any element in the nav to
 * get an auto-updating "API Live / Offline" badge.
 */

const API = (() => {

  /* ── CONFIG ──────────────────────────────────────────────── */
  const BASE      = window.AGRIFLOW_API || 'http://localhost:5000/api';
  const TOKEN_KEY = 'agriflow_token';

  /* ── TOKEN HELPERS ───────────────────────────────────────── */
  const getToken   = ()    => localStorage.getItem(TOKEN_KEY);
  const saveToken  = (tok) => localStorage.setItem(TOKEN_KEY, tok);
  const clearToken = ()    => localStorage.removeItem(TOKEN_KEY);

  /* ── CORE FETCH ──────────────────────────────────────────── */
  async function req(method, path, body, isPublic = false) {
    const headers = { 'Content-Type': 'application/json' };
    const token   = getToken();
    if (token && !isPublic) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);

    let res;
    try {
      res = await fetch(`${BASE}${path}`, opts);
    } catch {
      return null;   // backend unreachable
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) clearToken();
      return null;
    }
    return json.data !== undefined ? json.data : json;
  }

  const get     = (path, q) => req('GET',    path + _qs(q), null, true);
  const post    = (path, b) => req('POST',   path, b);
  const put     = (path, b) => req('PUT',    path, b);
  const del     = (path)    => req('DELETE', path);
  const getAuth = (path, q) => req('GET',    path + _qs(q));
  const postPub = (path, b) => req('POST',   path, b, true);

  function _qs(params) {
    if (!params) return '';
    const s = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
      )
    ).toString();
    return s ? `?${s}` : '';
  }

  /* ── AUTH ────────────────────────────────────────────────── */
  const auth = {
    async login(credentials) {
      const data = await postPub('/auth/login', credentials);
      if (data?.token) {
        saveToken(data.token);
        if (window.AgriDB && data.user) AgriDB.saveUser(data.user);
      }
      return data;
    },
    async register(userData) {
      const data = await postPub('/auth/register', userData);
      if (data?.token) {
        saveToken(data.token);
        if (window.AgriDB && data.user) AgriDB.saveUser(data.user);
      }
      return data;
    },
    me:     () => getAuth('/auth/me'),
    logout: () => clearToken(),
  };

  /* ── SUBMISSIONS ─────────────────────────────────────────── */
  const submissions = {
    list:         (f)         => get('/submissions', f),
    getById:      (id)        => get(`/submissions/${id}`),
    create:       (data)      => post('/submissions', data),
    updateStatus: (id, status)=> put(`/submissions/${id}/status`, { status }),
    remove:       (id)        => del(`/submissions/${id}`),
  };

  /* ── LISTINGS ────────────────────────────────────────────── */
  const listings = {
    list:    (f)     => get('/listings', f),
    getById: (id)    => get(`/listings/${id}`),
    create:  (data)  => post('/listings', data),
    update:  (id, d) => put(`/listings/${id}`, d),
    remove:  (id)    => del(`/listings/${id}`),
  };

  /* ── ALERTS ──────────────────────────────────────────────── */
  const alerts = {
    list:        (f)  => getAuth('/alerts', f),
    create:      (d)  => post('/alerts', d),
    markRead:    (id) => put(`/alerts/${id}/read`),
    markAllRead: ()   => put('/alerts/read-all'),
  };

  /* ── MAP ─────────────────────────────────────────────────── */
  const map = {
    aggregates: (p) => get('/map/aggregates', p),
    districts:  ()  => get('/map/districts'),
    forecast:   (p) => get('/map/forecast',   p),
    crops:      ()  => get('/map/crops'),
  };

  /* ── ADMIN ───────────────────────────────────────────────── */
  const admin = {
    stats:            ()        => getAuth('/admin/stats'),
    users:            (f)       => getAuth('/admin/users', f),
    getUserById:      (id)      => getAuth(`/admin/users/${id}`),
    updateUserStatus: (id, s)   => put(`/admin/users/${id}/status`, { status: s }),
    submissions:      (f)       => getAuth('/admin/submissions', f),
    activity:         ()        => getAuth('/admin/activity'),
  };

  /* ── USERS ───────────────────────────────────────────────── */
  const users = {
    summary:        ()      => get('/users'),
    me:             ()      => getAuth('/users/me'),
    updateMe:       (data)  => put('/users/me', data),
    changePassword: (data)  => put('/users/me/password', data),
    submissions:    (id, f) => getAuth(`/users/${id}/submissions`, f),
  };

  /* ── HEALTH ──────────────────────────────────────────────── */
  async function ping() {
    try {
      const res = await fetch(BASE.replace('/api', '') + '/api/health');
      return res.ok;
    } catch { return false; }
  }

  /* ── AUTO-SYNC ───────────────────────────────────────────── */
  async function syncLocalToServer() {
    if (!window.AgriDB || !getToken()) return;
    const pending = AgriDB.getSubmissions()
      .filter(s => s.id.startsWith('sub_') && !s.id.startsWith('sub_seed')
                   && !s.id.startsWith('sub_demo'));
    let synced = 0;
    for (const sub of pending) {
      const result = await submissions.create(sub);
      if (result) synced++;
    }
    if (synced > 0) console.info(`[API] Synced ${synced} local submission(s) to server.`);
  }

  /* ── SERVER-SENT EVENTS ──────────────────────────────────── */
  let _sse = null;

  function connectSSE() {
    if (_sse) return;
    try {
      _sse = new EventSource(`${BASE}/events`);

      // New submission → refresh map choropleth + farmer table
      _sse.addEventListener('submission.created', () => {
        if (typeof window.renderLayer       === 'function') window.renderLayer('market');
        if (typeof window.renderFarmerTable === 'function') window.renderFarmerTable();
      });

      // KPI change → update admin stat cards directly (no extra fetch needed)
      _sse.addEventListener('kpi.updated', (e) => {
        try {
          const kpis = JSON.parse(e.data);
          // updateKPIs() in admin-patch.js can accept a pre-fetched kpis object
          if (typeof window._applyKPIs === 'function') window._applyKPIs(kpis);
        } catch { /* ignore */ }
      });

      // New alert → refresh panels
      _sse.addEventListener('alert.created', () => {
        if (typeof window.renderAlerts    === 'function') window.renderAlerts();
        if (typeof window.renderNavAlerts === 'function') window.renderNavAlerts();
      });

      // New listing → refresh marketplace
      _sse.addEventListener('listing.created', () => {
        if (typeof window.renderListings === 'function') window.renderListings();
      });

      _sse.onerror = () => {
        console.warn('[SSE] Connection lost — EventSource will auto-retry');
        _sse = null;
      };

      console.info('[SSE] Connected to /api/events');
    } catch {
      console.warn('[SSE] EventSource not available in this environment');
    }
  }

  /* ── CONNECTION STATUS BADGE ─────────────────────────────── */
  function _updateStatusBadge(online) {
    document.querySelectorAll('[data-backend-status]').forEach(el => {
      el.innerHTML = online
        ? `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-green-600">
             <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
             API Live
           </span>`
        : `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500">
             <span class="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
             Offline
           </span>`;
    });
  }

  /* ── BOOT ────────────────────────────────────────────────── */
  (async () => {
    const alive = await ping();
    window.AGRIFLOW_BACKEND_ONLINE = alive;
    _updateStatusBadge(alive);
    if (alive) {
      console.info('[API] Backend reachable ✅  http://localhost:5000');
      connectSSE();
      syncLocalToServer();
    } else {
      console.warn('[API] Backend offline — all data served from localStorage');
    }
  })();

  /* ── PUBLIC ──────────────────────────────────────────────── */
  return {
    auth, submissions, listings, alerts,
    map, admin, users,
    ping, syncLocalToServer, connectSSE,
    getToken, saveToken, clearToken,
  };

})();

window.API = API;
