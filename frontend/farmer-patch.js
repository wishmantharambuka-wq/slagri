/**
 * farmer-patch.js  —  Wire farmer form to AgriDB + seed demo data
 * ================================================================
 * Loaded before </body> in farmer.html.
 */

(function () {

  /* ── SEED DEMO DATA (once on fresh install) ──────────────────── */
  function seedDemoData() {
    if (!window.AgriDB) return;
    const existing = AgriDB.getSubmissions();
    if (existing.length > 0) return;  // already has data

    const crops     = ['Rice', 'Coconut', 'Tea', 'Vegetables', 'Fruits', 'Maize'];
    const districts = [
      { name: 'Colombo',      province: 'western'       },
      { name: 'Gampaha',      province: 'western'       },
      { name: 'Kandy',        province: 'central'       },
      { name: 'Nuwara Eliya', province: 'central'       },
      { name: 'Galle',        province: 'southern'      },
      { name: 'Hambantota',   province: 'southern'      },
      { name: 'Jaffna',       province: 'northern'      },
      { name: 'Batticaloa',   province: 'eastern'       },
      { name: 'Anuradhapura', province: 'north_central' },
      { name: 'Polonnaruwa',  province: 'north_central' },
      { name: 'Badulla',      province: 'uva'           },
      { name: 'Ratnapura',    province: 'sabaragamuwa'  },
      { name: 'Kurunegala',   province: 'north_western' }
    ];
    const names = [
      'Kamal Silva', 'Sunil Perera', 'Nimal Fernando', 'Priya Jayawardena',
      'Ranjith Bandara', 'Chaminda Rajapaksa', 'Dilhan Weerasekara'
    ];

    for (let i = 0; i < 35; i++) {
      const d       = districts[i % districts.length];
      const daysAgo = Math.floor(Math.random() * 90);
      const ts      = new Date(Date.now() - daysAgo * 86400000).toISOString();
      const qty     = Math.floor(Math.random() * 8000) + 500;

      const sub = {
        id          : 'sub_demo_' + i,
        timestamp   : ts,
        status      : ['pending', 'verified', 'verified'][i % 3],
        farmerName  : names[i % names.length],
        district    : d.name,
        province    : d.province,
        crop        : crops[i % crops.length],
        quantity    : qty,
        unit        : 'kg',
        price       : Math.floor(Math.random() * 200) + 50,
        harvestDate : ts.slice(0, 10),
        notes       : 'Demo data'
      };

      // Insert directly to avoid duplicate auto-alert spam
      const db   = JSON.parse(localStorage.getItem('agri_db') || '{"submissions":[],"listings":[],"alerts":[],"users":[],"version":1}');
      db.submissions.push(sub);
      localStorage.setItem('agri_db', JSON.stringify(db));
    }

    console.info('[farmer-patch] 35 demo submissions seeded.');
  }


  /* ── WIRE FORM SUBMISSION ────────────────────────────────────── */
  function wireFarmerForm() {
    const form = document.querySelector('form#farmer-form')
               || document.querySelector('form[data-type="submission"]')
               || document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!window.AgriDB) { console.warn('[farmer-patch] AgriDB not loaded.'); return; }

      const get = id => {
        const el = document.getElementById(id) || form.querySelector(`[name="${id}"]`);
        return el ? el.value.trim() : '';
      };

      const sub = {
        farmerName  : get('farmer-name') || get('f-name') || get('name'),
        district    : get('district'),
        province    : get('province'),
        crop        : get('crop') || get('crop-type'),
        quantity    : get('quantity') || get('qty'),
        unit        : get('unit') || 'kg',
        price       : get('price') || get('unit-price'),
        harvestDate : get('harvest-date') || get('date'),
        notes       : get('notes'),
        role        : 'farmer'
      };

      if (!sub.farmerName || !sub.crop || !sub.quantity) {
        alert('Please fill in Name, Crop, and Quantity before submitting.');
        return;
      }

      let saved;
      // Try the real API first; fall back to localStorage
      if (window.AGRIFLOW_BACKEND_ONLINE && window.API) {
        const result = await API.submissions.create(sub);
        if (result) {
          saved = result;
          // Mirror into localStorage so the UI stays consistent offline
          AgriDB.addSubmission({ ...sub, id: result.id, status: result.status });
        }
      }
      if (!saved) {
        saved = AgriDB.addSubmission(sub);
      }
      console.info('[farmer-patch] Submission saved:', saved.id);
      _showToast(`${sub.crop} submission saved! (${parseFloat(sub.quantity).toLocaleString()} ${sub.unit})`);
      form.reset();
      renderSubmissionHistory();
    });
  }

  function _showToast(msg) {
    const el = document.createElement('div');
    el.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2';
    el.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }


  /* ── SUBMISSION HISTORY TABLE ─────────────────────────────────── */
  async function renderSubmissionHistory() {
    let container = document.getElementById('submission-history');
    if (!container) {
      container = document.createElement('div');
      container.id = 'submission-history';
      container.className = 'mt-8 px-4 pb-8';
      const main = document.querySelector('main') || document.querySelector('.container') || document.body;
      main.appendChild(container);
    }

    const currentUser = (() => {
      try { return JSON.parse(localStorage.getItem('currentUser') || '{}'); }
      catch { return {}; }
    })();

    let subs;
    if (window.AGRIFLOW_BACKEND_ONLINE && window.API) {
      const result = await API.submissions.list({ limit: 10 });
      subs = (result?.data || []).filter(s => !currentUser.name || s.farmerName === currentUser.name);
    } else {
      subs = (window.AgriDB ? AgriDB.getSubmissions() : [])
        .filter(s => !currentUser.name || s.farmerName === currentUser.name)
        .slice(0, 10);
    }

    const badge = s =>
      s === 'pending'  ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">Pending</span>' :
      s === 'verified' ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100  text-green-700">Verified</span>' :
                         '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100    text-red-700">Rejected</span>';

    container.innerHTML = `
      <div class="glass-panel rounded-2xl p-5">
        <h3 class="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <i class="fas fa-history text-orange-500"></i> Recent Submissions
        </h3>
        ${!subs.length
          ? '<p class="text-xs text-gray-400 text-center py-6">No submissions yet.</p>'
          : `<div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-gray-50 text-gray-500 font-bold uppercase">
                  <tr>
                    <th class="px-3 py-2">Date</th>
                    <th class="px-3 py-2">Crop</th>
                    <th class="px-3 py-2">District</th>
                    <th class="px-3 py-2 text-right">Quantity</th>
                    <th class="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  ${subs.map(s => `
                    <tr class="hover:bg-white/60">
                      <td class="px-3 py-2 text-gray-500">${new Date(s.timestamp).toLocaleDateString('en-LK')}</td>
                      <td class="px-3 py-2 font-medium text-gray-700">${s.crop}</td>
                      <td class="px-3 py-2 text-gray-600">${s.district || '—'}</td>
                      <td class="px-3 py-2 text-right text-gray-700">${parseFloat(s.quantity||0).toLocaleString()} ${s.unit||'kg'}</td>
                      <td class="px-3 py-2">${badge(s.status)}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>`}
      </div>`;
  }
  window.renderSubmissionHistory = renderSubmissionHistory;


  /* ── BOOT ───────────────────────────────────────────────────── */
  function boot() {
    seedDemoData();
    wireFarmerForm();
    renderSubmissionHistory();
    console.info('[farmer-patch] Farmer page enhanced.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
