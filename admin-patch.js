/**
 * admin-patch.js  —  Live KPI wiring for admin.html
 * ===================================================
 * Loaded before admin.js. Reads from AgriDB and populates:
 *   - The 4 stat KPI cards
 *   - The alerts panel (#alerts-container)
 *   - The farmer submissions table (#farmer-tbody)
 *   - The nav bell badge (#nav-alert-count)
 * Auto-refreshes KPIs every 30 seconds.
 */

(function () {

  /* ── KPI CARDS ──────────────────────────────────────────────── */
  async function updateKPIs() {
    // Prefer live API data; fall back to localStorage
    let kpis = window.AgriDB ? AgriDB.getKPIs() : {};
    if (window.AGRIFLOW_BACKEND_ONLINE && window.API) {
      const apiStats = await API.admin.stats();
      if (apiStats) kpis = apiStats;
    }

    // Query all glass-card stat cards and match by their label text
    document.querySelectorAll('.glass-card').forEach(card => {
      const label = card.querySelector('p.text-xs, p.text-\\[10px\\]');
      const value = card.querySelector('h3');
      if (!label || !value) return;
      const key = label.textContent.trim().toUpperCase();
      const map = {
        'TOTAL USERS'          : kpis.totalUsers,
        'DATA RECORDS'         : kpis.totalSubmissions,
        'PENDING REVIEW'       : kpis.pendingSubmissions,
        'ACTIVE LISTINGS'      : kpis.activeListings,
        'FARMERS REGISTERED'   : kpis.totalFarmers,
        'SHORTAGE REGIONS'     : kpis.shortageRegions,
        'SURPLUS REGIONS'      : kpis.surplusRegions,
        'UNREAD ALERTS'        : kpis.unreadAlerts
      };
      if (map[key] !== undefined) value.textContent = map[key].toLocaleString();
    });

    // Nav badge
    const badge = document.getElementById('nav-alert-count');
    if (badge) badge.textContent = kpis.unreadAlerts;

    // Footer record count
    const rc = document.getElementById('record-count');
    if (rc) rc.textContent = `${kpis.totalSubmissions} records`;
  }


  /* ── ALERTS SECTION ─────────────────────────────────────────── */
  async function renderAlerts() {
    const container = document.getElementById('alerts-container');
    if (!container) return;

    let alerts = window.AgriDB ? AgriDB.getAlerts() : [];
    if (window.AGRIFLOW_BACKEND_ONLINE && window.API) {
      const apiAlerts = await API.alerts.list();
      if (apiAlerts && apiAlerts.length) alerts = apiAlerts;
    }
    if (!alerts.length) {
      container.innerHTML = `
        <div class="text-center py-10 text-gray-400">
          <i class="fas fa-bell-slash text-3xl mb-3 block"></i>
          <p class="text-sm">No alerts yet. They'll appear here automatically.</p>
        </div>`;
      return;
    }

    const severityStyle = {
      critical : 'border-l-4 border-red-500 bg-red-50',
      warning  : 'border-l-4 border-orange-400 bg-orange-50',
      info     : 'border-l-4 border-blue-400 bg-blue-50'
    };
    const severityIcon = {
      critical : 'fa-exclamation-circle text-red-500',
      warning  : 'fa-exclamation-triangle text-orange-400',
      info     : 'fa-info-circle text-blue-400'
    };

    container.innerHTML = alerts.slice(0, 50).map(a => {
      const ts    = new Date(a.timestamp).toLocaleString('en-LK', {
        timeZone : 'Asia/Colombo', day:'2-digit', month:'short',
        hour:'2-digit', minute:'2-digit'
      });
      const sty   = severityStyle[a.severity]  || severityStyle.info;
      const icon  = severityIcon[a.severity]   || severityIcon.info;
      return `
        <div class="p-4 rounded-xl ${sty} flex items-start gap-3 ${a.read ? 'opacity-60' : ''}"
             data-alert-id="${a.id}">
          <i class="fas ${icon} mt-0.5 flex-shrink-0"></i>
          <div class="flex-grow min-w-0">
            <div class="flex justify-between items-start gap-2">
              <p class="text-sm font-bold text-gray-800 truncate">${a.title || 'System Alert'}</p>
              <span class="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">${ts}</span>
            </div>
            <p class="text-xs text-gray-600 mt-0.5">${a.message || ''}</p>
          </div>
          ${!a.read ? `<button onclick="AgriDB.markAlertRead('${a.id}');renderAlerts();updateKPIs()"
              class="text-gray-300 hover:text-gray-500 text-xs ml-1 flex-shrink-0" title="Mark read">
              <i class="fas fa-check"></i></button>` : ''}
        </div>`;
    }).join('');
  }
  window.renderAlerts = renderAlerts;


  /* ── FARMER TABLE ───────────────────────────────────────────── */
  async function renderFarmerTable(searchTerm, filterCrop) {
    const tbody = document.getElementById('farmer-tbody');
    if (!tbody) return;

    let subs;
    if (window.AGRIFLOW_BACKEND_ONLINE && window.API) {
      const result = await API.admin.submissions({
        q: searchTerm || undefined,
        crop: (filterCrop && filterCrop !== 'all') ? filterCrop : undefined,
        limit: 100
      });
      subs = result?.data || [];
    } else {
      subs = window.AgriDB ? AgriDB.getSubmissions() : [];
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        subs = subs.filter(s =>
          (s.farmerName || '').toLowerCase().includes(q) ||
          (s.district   || '').toLowerCase().includes(q)
        );
      }
      if (filterCrop && filterCrop !== 'all') {
        subs = subs.filter(s => s.crop === filterCrop);
      }
    }

    if (!subs.length) {
      tbody.innerHTML = `<tr><td colspan="6"
        class="text-center py-8 text-gray-400 text-sm">
        No submissions yet. Farmers will appear here after they submit data.</td></tr>`;
      const rc = document.getElementById('record-count');
      if (rc) rc.textContent = '0 records';
      return;
    }

    const badge = s =>
      s === 'pending'  ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">Pending</span>' :
      s === 'verified' ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100  text-green-700">Verified</span>' :
                         '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100    text-red-700">Rejected</span>';

    tbody.innerHTML = subs.slice(0, 100).map(s => {
      const ts = new Date(s.timestamp).toLocaleDateString('en-LK', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      return `
        <tr class="hover:bg-white/60 transition">
          <td class="px-4 py-3 font-medium text-gray-800 text-sm">${s.farmerName || '—'}</td>
          <td class="px-4 py-3 text-sm text-gray-600">${s.district || '—'}</td>
          <td class="px-4 py-3 text-sm text-gray-600">${s.crop || '—'}</td>
          <td class="px-4 py-3 text-sm text-gray-600 text-right">${parseFloat(s.quantity||0).toLocaleString()} ${s.unit||'kg'}</td>
          <td class="px-4 py-3">${badge(s.status)}</td>
          <td class="px-4 py-3 text-xs text-gray-400">${ts}</td>
        </tr>`;
    }).join('');

    const rc = document.getElementById('record-count');
    if (rc) rc.textContent = `${subs.length} records`;
  }
  window.renderFarmerTable = renderFarmerTable;


  /* ── NAV ALERTS DROPDOWN ────────────────────────────────────── */
  function renderNavAlerts() {
    if (!window.AgriDB) return;
    const list = document.getElementById('nav-alerts-list');
    if (!list) return;
    const unread = AgriDB.getAlerts(true).slice(0, 5);
    if (!unread.length) {
      list.innerHTML = '<p class="text-xs text-gray-400 text-center py-3">No new alerts</p>';
      return;
    }
    list.innerHTML = unread.map(a => `
      <div class="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer text-xs">
        <p class="font-bold text-gray-700 truncate">${a.title || 'Alert'}</p>
        <p class="text-gray-500 truncate">${a.message || ''}</p>
      </div>`).join('');
  }
  window.renderNavAlerts = renderNavAlerts;


  /* ── BIND SEARCH & FILTER CONTROLS ─────────────────────────── */
  function _bindControls() {
    const search = document.getElementById('farmer-search');
    const filter = document.querySelectorAll('#sec-farmers select')[0];
    if (search) search.addEventListener('input',  () => renderFarmerTable(search.value, filter?.value));
    if (filter) filter.addEventListener('change', () => renderFarmerTable(search?.value, filter.value));
  }


  /* ── BOOT ───────────────────────────────────────────────────── */
  function boot() {
    updateKPIs();
    renderAlerts();
    renderFarmerTable();
    renderNavAlerts();
    _bindControls();
    setInterval(() => { updateKPIs(); renderNavAlerts(); }, 30000);
    console.info('[admin-patch] Live KPIs active.');
  }

  window.updateKPIs = updateKPIs;

  /**
   * _applyKPIs — applies a pre-fetched kpis object directly to the cards.
   * Called by api-client.js SSE handler for instant (zero-fetch) updates.
   */
  function _applyKPIs(kpis) {
    if (!kpis) return;
    document.querySelectorAll('.glass-card').forEach(card => {
      const label = card.querySelector('p.text-xs, p.text-\[10px\]');
      const value = card.querySelector('h3');
      if (!label || !value) return;
      const key = label.textContent.trim().toUpperCase();
      const map = {
        'TOTAL USERS'          : kpis.totalUsers,
        'DATA RECORDS'         : kpis.totalSubmissions,
        'PENDING REVIEW'       : kpis.pendingSubmissions,
        'ACTIVE LISTINGS'      : kpis.activeListings,
        'FARMERS REGISTERED'   : kpis.totalFarmers,
        'SHORTAGE REGIONS'     : kpis.shortageRegions,
        'SURPLUS REGIONS'      : kpis.surplusRegions,
        'UNREAD ALERTS'        : kpis.unreadAlerts
      };
      if (map[key] !== undefined) value.textContent = map[key].toLocaleString();
    });
    const badge = document.getElementById('nav-alert-count');
    if (badge && kpis.unreadAlerts !== undefined)
      badge.textContent = kpis.unreadAlerts;
    const rc = document.getElementById('record-count');
    if (rc && kpis.totalSubmissions !== undefined)
      rc.textContent = `${kpis.totalSubmissions} records`;
  }
  window._applyKPIs = _applyKPIs;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
