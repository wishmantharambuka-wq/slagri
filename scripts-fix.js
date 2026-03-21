/**
 * scripts-fix.js  —  Bug fixes for scripts.js / index.html
 * ==========================================================
 * Loaded after scripts.js (or after the inline script in index.html).
 * Fixes two missing window-level function definitions and wires
 * live KPI stats from AgriDB into the index page.
 */

(function () {

  /* ── FIX 1: window.closeAnalysis ─────────────────────────────── */
  // Called in scripts.js line 206 but never defined.
  if (!window.closeAnalysis) {
    window.closeAnalysis = function () {
      const modal = document.getElementById('analysis-modal')
                 || document.getElementById('calc-modal')
                 || document.querySelector('[id*="analysis"]');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
    };
    console.info('[scripts-fix] closeAnalysis defined.');
  }

  /* ── FIX 2: window.selectRegion ──────────────────────────────── */
  // Called in scripts.js line 251 but never defined.
  if (!window.selectRegion) {
    window.selectRegion = function (type, id) {
      if (typeof renderDistrictGrid === 'function' && type === 'province') {
        renderDistrictGrid(id);
      } else if (typeof renderDSDList === 'function' && type === 'district') {
        renderDSDList(id);
      } else {
        console.warn('[scripts-fix] selectRegion: no handler for type', type, id);
      }
    };
    console.info('[scripts-fix] selectRegion defined.');
  }

  /* ── INDEX PAGE: wire AgriDB stats to any live-stat elements ─── */
  function updateIndexStats() {
    if (!window.AgriDB) return;
    const kpis = AgriDB.getKPIs();

    const map = {
      '#stat-farmers'    : kpis.totalFarmers,
      '#stat-submissions': kpis.totalSubmissions,
      '#stat-surplus'    : kpis.surplusRegions,
      '#stat-shortage'   : kpis.shortageRegions,
      '.kpi-farmers'     : kpis.totalFarmers,
      '.kpi-listings'    : kpis.activeListings
    };

    Object.entries(map).forEach(([sel, val]) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = val.toLocaleString();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateIndexStats);
  } else {
    updateIndexStats();
  }

})();
