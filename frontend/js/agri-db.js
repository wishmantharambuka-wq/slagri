/**
 * agri-db.js  —  AgriFlow Shared Data Service
 * =============================================
 * Loaded by every HTML page BEFORE any page-specific scripts.
 * Provides a unified read/write API backed by localStorage,
 * with optional async sync to the Express backend at /api/*.
 */

const AgriDB = (() => {

  /* ─── SCHEMA ─────────────────────────────────────────────────── */
  const STORAGE_KEY = 'agri_db';
  const API_BASE    = window.AGRIFLOW_API || 'http://localhost:5000/api';

  const DEFAULT_DB = {
    version     : 1,
    submissions : [],
    listings    : [],
    alerts      : [],
    users       : [],
    lastSync    : null
  };

  /* ─── LOW-LEVEL STORAGE ──────────────────────────────────────── */
  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_DB, ...JSON.parse(raw) } : { ...DEFAULT_DB };
    } catch { return { ...DEFAULT_DB }; }
  }

  function _save(db) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
    catch(e) { console.warn('[AgriDB] localStorage write failed:', e); }
  }

  /* ─── BACKEND SYNC (optional) ───────────────────────────────── */
  async function _trySync(endpoint, method = 'GET', body = null) {
    try {
      const token   = localStorage.getItem('agriflow_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const opts = { method, headers };
      if (body) opts.body = JSON.stringify(body);
      const res  = await fetch(API_BASE + endpoint, opts);
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }   // backend unreachable — local data is source of truth
  }

  /* ─── SUBMISSIONS ────────────────────────────────────────────── */
  function addSubmission(data) {
    const db  = _load();
    const sub = {
      id        : 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
      timestamp : new Date().toISOString(),
      status    : 'pending',
      ...data
    };
    db.submissions.unshift(sub);
    _autoAlert(sub, db);
    _save(db);
    _trySync('/submissions', 'POST', sub);
    return sub;
  }

  function getSubmissions(filters = {}) {
    const db   = _load();
    let   list = db.submissions;
    if (filters.district) list = list.filter(s => s.district === filters.district);
    if (filters.crop)     list = list.filter(s => s.crop     === filters.crop);
    if (filters.province) list = list.filter(s => s.province === filters.province);
    if (filters.status)   list = list.filter(s => s.status   === filters.status);
    return list;
  }

  /**
   * Aggregate submissions per district.
   * Returns array matching the schema of map.html's generateDistrictData().
   */
  function getDistrictAggregates(crop) {
    const subs = getSubmissions(crop ? { crop } : {});
    const byDistrict = {};

    subs.forEach(s => {
      const key = s.district;
      if (!key) return;
      if (!byDistrict[key]) {
        byDistrict[key] = {
          district    : key,
          province    : s.province || '',
          coords      : s.coords   || null,
          harvest     : 0,
          consumption : 0,
          surplus     : 0,
          priceSum    : 0,
          count       : 0,
          risk        : { flood: 'low', drought: 'low', score: 20 },
          suitability : { score: 60 }
        };
      }
      const qty = parseFloat(s.quantity) || 0;
      byDistrict[key].harvest  += qty;
      byDistrict[key].priceSum += parseFloat(s.price || 0);
      byDistrict[key].count    += 1;
    });

    return Object.values(byDistrict).map(d => {
      d.consumption = Math.round(d.harvest * 0.70);
      d.surplus     = Math.round(d.harvest - d.consumption);
      d.status      = d.surplus > 0 ? 'surplus' : d.surplus < -10 ? 'shortage' : 'stable';
      d.price       = {
        current : d.count > 0 ? Math.round(d.priceSum / d.count) : 0,
        trend   : '+0%'
      };
      return d;
    });
  }

  /* ─── LISTINGS ───────────────────────────────────────────────── */
  function addListing(data) {
    const db      = _load();
    const listing = {
      id        : 'lst_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
      timestamp : new Date().toISOString(),
      status    : 'active',
      ...data
    };
    db.listings.unshift(listing);
    _save(db);
    _trySync('/listings', 'POST', listing);
    return listing;
  }

  function getListings(filters = {}) {
    const db   = _load();
    let   list = db.listings;
    if (filters.status)   list = list.filter(l => l.status   === filters.status);
    if (filters.crop)     list = list.filter(l => l.crop     === filters.crop);
    if (filters.province) list = list.filter(l => l.province === filters.province);
    return list;
  }

  /* ─── ALERTS ─────────────────────────────────────────────────── */
  function addAlert(data) {
    const db    = _load();
    const alert = {
      id        : 'alrt_' + Date.now(),
      timestamp : new Date().toISOString(),
      read      : false,
      severity  : 'info',
      ...data
    };
    db.alerts.unshift(alert);
    if (db.alerts.length > 200) db.alerts = db.alerts.slice(0, 200);
    _save(db);
    return alert;
  }

  function getAlerts(unreadOnly) {
    const db = _load();
    return unreadOnly ? db.alerts.filter(a => !a.read) : db.alerts;
  }

  function markAlertRead(id) {
    const db = _load();
    const a  = db.alerts.find(a => a.id === id);
    if (a) { a.read = true; _save(db); }
  }

  /* ─── USERS ──────────────────────────────────────────────────── */
  function saveUser(userData) {
    const db   = _load();
    const idx  = db.users.findIndex(u => u.name === userData.name && u.role === userData.role);
    const user = { ...userData, lastLogin: new Date().toISOString() };
    if (idx >= 0) db.users[idx] = user;
    else          db.users.unshift(user);
    _save(db);
    return user;
  }

  function getUsers(role) {
    const db = _load();
    return role ? db.users.filter(u => u.role === role) : db.users;
  }

  /* ─── KPI AGGREGATOR ─────────────────────────────────────────── */
  function getKPIs() {
    const db          = _load();
    const submissions = db.submissions;
    const listings    = db.listings;
    const alerts      = db.alerts;
    const users       = db.users;
    const byDistrict  = getDistrictAggregates();

    return {
      totalFarmers      : users.filter(u => u.role === 'farmer').length,
      totalCustomers    : users.filter(u => u.role === 'customer').length,
      totalUsers        : users.length,
      totalSubmissions  : submissions.length,
      pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
      activeListings    : listings.filter(l => l.status === 'active').length,
      shortageRegions   : byDistrict.filter(d => d.status === 'shortage').length,
      surplusRegions    : byDistrict.filter(d => d.status === 'surplus').length,
      unreadAlerts      : alerts.filter(a => !a.read).length,
      lastUpdated       : new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
    };
  }

  /* ─── AUTO-ALERT HELPER ──────────────────────────────────────── */
  function _autoAlert(sub, db) {
    const qty = parseFloat(sub.quantity) || 0;
    if (qty > 5000) {
      db.alerts.unshift({
        id        : 'alrt_auto_' + Date.now(),
        timestamp : new Date().toISOString(),
        read      : false,
        severity  : 'info',
        title     : `Large surplus declared in ${sub.district || 'unknown district'}`,
        message   : `${sub.farmerName || 'A farmer'} submitted ${qty.toLocaleString()} kg of ${sub.crop}. Consider marketplace listing.`,
        district  : sub.district,
        crop      : sub.crop
      });
    }
  }

  /* ─── RESET ──────────────────────────────────────────────────── */
  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    console.info('[AgriDB] Database reset. Refresh the page.');
  }

  /* ─── PUBLIC API ─────────────────────────────────────────────── */
  return {
    addSubmission,
    getSubmissions,
    getDistrictAggregates,
    addListing,
    getListings,
    addAlert,
    getAlerts,
    markAlertRead,
    saveUser,
    getUsers,
    getKPIs,
    reset
  };

})();

window.AgriDB = AgriDB;
