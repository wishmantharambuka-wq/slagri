// services/store.js  —  In-Memory Data Store
// ============================================
// This is the data layer used when DB_MODE=memory.
// Every service function reads/writes from these arrays.
//
// HOW TO SWAP TO SUPABASE:
//   1. npm install @supabase/supabase-js
//   2. Create services/supabase.client.js
//   3. Replace each function in this file with a Supabase query.
//   4. Set DB_MODE=supabase in .env
//
// The controllers never import this file directly — they use the
// service files (submission.service.js, etc.) which call here.
// That means swapping the DB only touches the service files.

// Use Node.js built-in crypto (no install needed — requires Node >= 14.17)
const { randomUUID: uuidv4 } = require("crypto");

// ── SEED DATA ─────────────────────────────────────────────────────────────────
// 35 sample submissions so the system has real data from day one.
const CROPS     = ["Rice", "Coconut", "Tea", "Vegetables", "Fruits", "Maize"];
const DISTRICTS = [
  { name: "Colombo",      province: "western"       },
  { name: "Gampaha",      province: "western"       },
  { name: "Kandy",        province: "central"       },
  { name: "Nuwara Eliya", province: "central"       },
  { name: "Galle",        province: "southern"      },
  { name: "Hambantota",   province: "southern"      },
  { name: "Jaffna",       province: "northern"      },
  { name: "Batticaloa",   province: "eastern"       },
  { name: "Anuradhapura", province: "north_central" },
  { name: "Polonnaruwa",  province: "north_central" },
  { name: "Badulla",      province: "uva"           },
  { name: "Ratnapura",    province: "sabaragamuwa"  },
  { name: "Kurunegala",   province: "north_western" },
];
const FARMER_NAMES = [
  "Kamal Silva", "Sunil Perera", "Nimal Fernando", "Priya Jayawardena",
  "Ranjith Bandara", "Chaminda Rajapaksa", "Dilhan Weerasekara"
];

function _seedSubmissions() {
  return Array.from({ length: 35 }, (_, i) => {
    const d       = DISTRICTS[i % DISTRICTS.length];
    const daysAgo = Math.floor(Math.random() * 90);
    const qty     = Math.floor(Math.random() * 8000) + 500;
    return {
      id          : "sub_seed_" + i,
      farmerName  : FARMER_NAMES[i % FARMER_NAMES.length],
      district    : d.name,
      province    : d.province,
      crop        : CROPS[i % CROPS.length],
      quantity    : qty,
      unit        : "kg",
      price       : Math.floor(Math.random() * 200) + 50,
      harvestDate : new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10),
      notes       : "Seed data",
      status      : ["pending", "verified", "verified"][i % 3],
      createdAt   : new Date(Date.now() - daysAgo * 86400000).toISOString(),
      updatedAt   : new Date(Date.now() - daysAgo * 86400000).toISOString(),
    };
  });
}

// ── STORES ────────────────────────────────────────────────────────────────────
const store = {
  users: [
    {
      id       : "user_admin_1",
      name     : "Administrator",
      email    : "admin@agriflow.lk",
      role     : "admin",
      status   : "active",
      createdAt: new Date().toISOString(),
    }
  ],
  submissions : _seedSubmissions(),
  listings    : [],
  alerts      : [
    {
      id       : "alrt_seed_1",
      title    : "System Initialized",
      message  : "AgriFlow backend started with seed data.",
      severity : "info",
      read     : false,
      district : null,
      crop     : null,
      createdAt: new Date().toISOString(),
    }
  ],
};

// ── GENERIC HELPERS ───────────────────────────────────────────────────────────
const db = {

  // ── USERS ──
  findUsers(filters = {}) {
    let list = [...store.users];
    if (filters.role)   list = list.filter(u => u.role === filters.role);
    if (filters.status) list = list.filter(u => u.status === filters.status);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
      );
    }
    return list;
  },

  findUserById(id) {
    return store.users.find(u => u.id === id) || null;
  },

  findUserByEmail(email) {
    return store.users.find(u => u.email === email) || null;
  },

  createUser(data) {
    const user = {
      id        : "user_" + uuidv4().slice(0, 8),
      status    : "active",
      createdAt : new Date().toISOString(),
      updatedAt : new Date().toISOString(),
      ...data
    };
    store.users.unshift(user);
    return user;
  },

  updateUser(id, data) {
    const idx = store.users.findIndex(u => u.id === id);
    if (idx < 0) return null;
    store.users[idx] = { ...store.users[idx], ...data, updatedAt: new Date().toISOString() };
    return store.users[idx];
  },

  // ── SUBMISSIONS ──
  findSubmissions(filters = {}) {
    let list = [...store.submissions];
    if (filters.district) list = list.filter(s => s.district === filters.district);
    if (filters.province) list = list.filter(s => s.province === filters.province);
    if (filters.crop)     list = list.filter(s => s.crop     === filters.crop);
    if (filters.status)   list = list.filter(s => s.status   === filters.status);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(s =>
        s.farmerName.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
      );
    }
    // Pagination
    const page  = parseInt(filters.page  || 1);
    const limit = parseInt(filters.limit || 50);
    const total = list.length;
    list = list.slice((page - 1) * limit, page * limit);
    return { data: list, total, page, limit };
  },

  findSubmissionById(id) {
    return store.submissions.find(s => s.id === id) || null;
  },

  createSubmission(data) {
    const sub = {
      id        : "sub_" + uuidv4().slice(0, 8),
      status    : "pending",
      createdAt : new Date().toISOString(),
      updatedAt : new Date().toISOString(),
      ...data
    };
    store.submissions.unshift(sub);
    // Auto-alert for large quantity
    if (parseFloat(sub.quantity) > 5000) {
      db.createAlert({
        title    : `Large surplus declared in ${sub.district}`,
        message  : `${sub.farmerName} submitted ${parseFloat(sub.quantity).toLocaleString()} kg of ${sub.crop}.`,
        severity : "info",
        district : sub.district,
        crop     : sub.crop,
      });
    }
    return sub;
  },

  updateSubmission(id, data) {
    const idx = store.submissions.findIndex(s => s.id === id);
    if (idx < 0) return null;
    store.submissions[idx] = {
      ...store.submissions[idx],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return store.submissions[idx];
  },

  deleteSubmission(id) {
    const idx = store.submissions.findIndex(s => s.id === id);
    if (idx < 0) return false;
    store.submissions.splice(idx, 1);
    return true;
  },

  // ── LISTINGS ──
  findListings(filters = {}) {
    let list = [...store.listings];
    if (filters.status)   list = list.filter(l => l.status   === filters.status);
    if (filters.crop)     list = list.filter(l => l.crop     === filters.crop);
    if (filters.province) list = list.filter(l => l.province === filters.province);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(l =>
        (l.crop || "").toLowerCase().includes(q) ||
        (l.farmerName || "").toLowerCase().includes(q) ||
        (l.district || "").toLowerCase().includes(q)
      );
    }
    const page  = parseInt(filters.page  || 1);
    const limit = parseInt(filters.limit || 20);
    const total = list.length;
    list = list.slice((page - 1) * limit, page * limit);
    return { data: list, total, page, limit };
  },

  findListingById(id) {
    return store.listings.find(l => l.id === id) || null;
  },

  createListing(data) {
    const listing = {
      id        : "lst_" + uuidv4().slice(0, 8),
      status    : "active",
      createdAt : new Date().toISOString(),
      updatedAt : new Date().toISOString(),
      ...data
    };
    store.listings.unshift(listing);
    return listing;
  },

  updateListing(id, data) {
    const idx = store.listings.findIndex(l => l.id === id);
    if (idx < 0) return null;
    store.listings[idx] = {
      ...store.listings[idx],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return store.listings[idx];
  },

  deleteListing(id) {
    const idx = store.listings.findIndex(l => l.id === id);
    if (idx < 0) return false;
    store.listings.splice(idx, 1);
    return true;
  },

  // ── ALERTS ──
  findAlerts(filters = {}) {
    let list = [...store.alerts];
    if (filters.unread) list = list.filter(a => !a.read);
    if (filters.severity) list = list.filter(a => a.severity === filters.severity);
    return list;
  },

  createAlert(data) {
    const alert = {
      id        : "alrt_" + uuidv4().slice(0, 8),
      read      : false,
      severity  : "info",
      createdAt : new Date().toISOString(),
      ...data
    };
    store.alerts.unshift(alert);
    if (store.alerts.length > 200) store.alerts = store.alerts.slice(0, 200);
    return alert;
  },

  markAlertRead(id) {
    const a = store.alerts.find(a => a.id === id);
    if (!a) return null;
    a.read = true;
    return a;
  },

  markAllAlertsRead() {
    store.alerts.forEach(a => { a.read = true; });
    return true;
  },

  // ── AGGREGATES (for map) ──
  getDistrictAggregates(crop) {
    let subs = store.submissions.filter(s => s.status !== "rejected");
    if (crop && crop !== "all") subs = subs.filter(s => s.crop === crop);

    const byDistrict = {};
    subs.forEach(s => {
      const key = s.district;
      if (!key) return;
      if (!byDistrict[key]) {
        byDistrict[key] = {
          district    : key,
          province    : s.province || "",
          harvest     : 0,
          priceSum    : 0,
          count       : 0,
        };
      }
      byDistrict[key].harvest  += parseFloat(s.quantity) || 0;
      byDistrict[key].priceSum += parseFloat(s.price    ) || 0;
      byDistrict[key].count    += 1;
    });

    return Object.values(byDistrict).map(d => {
      const consumption = Math.round(d.harvest * 0.70);
      const surplus     = Math.round(d.harvest - consumption);
      return {
        district    : d.district,
        province    : d.province,
        harvest     : Math.round(d.harvest),
        consumption,
        surplus,
        status      : surplus > 0 ? "surplus" : surplus < -10 ? "shortage" : "stable",
        price       : {
          current : d.count > 0 ? Math.round(d.priceSum / d.count) : 0,
          trend   : "+0%",
        },
        count       : d.count,
        isLiveData  : true,
      };
    });
  },

  // ── KPIs (for admin dashboard) ──
  getKPIs() {
    const subs     = store.submissions;
    const listings = store.listings;
    const alerts   = store.alerts;
    const users    = store.users;
    const agg      = this.getDistrictAggregates();

    return {
      totalFarmers      : users.filter(u => u.role === "farmer").length,
      totalCustomers    : users.filter(u => u.role === "customer").length,
      totalUsers        : users.length,
      totalSubmissions  : subs.length,
      pendingSubmissions: subs.filter(s => s.status === "pending").length,
      verifiedSubmissions: subs.filter(s => s.status === "verified").length,
      activeListings    : listings.filter(l => l.status === "active").length,
      shortageRegions   : agg.filter(d => d.status === "shortage").length,
      surplusRegions    : agg.filter(d => d.status === "surplus").length,
      unreadAlerts      : alerts.filter(a => !a.read).length,
      lastUpdated       : new Date().toISOString(),
    };
  },
};

module.exports = db;
