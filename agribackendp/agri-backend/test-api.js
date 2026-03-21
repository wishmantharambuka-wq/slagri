// test-api.js  —  AgriFlow Backend Smoke Tests
// =============================================
// Run from the agri-backend folder WHILE the server is running:
//   node server.js &
//   node test-api.js
//
// Tests every endpoint group with real HTTP calls.
// No extra packages needed — uses Node's built-in fetch (Node >= 18).

const BASE = "http://localhost:5000/api";
let token  = null;
let passed = 0;
let failed = 0;

// ── HELPERS ──────────────────────────────────────────────────────────────────
async function req(method, path, body, useToken = false) {
  const headers = { "Content-Type": "application/json" };
  if (useToken && token) headers["Authorization"] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res  = await fetch(BASE + path, opts);
    const json = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, body: json };
  } catch (err) {
    return { status: 0, ok: false, body: {}, error: err.message };
  }
}

function assert(label, condition, extra = "") {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}${extra ? " — " + extra : ""}`);
    failed++;
  }
}

// ── TEST SUITES ───────────────────────────────────────────────────────────────

async function testHealth() {
  console.log("\n📡  HEALTH CHECK");
  const r = await req("GET", "/../api/health");
  // Try root instead
  const r2 = await fetch("http://localhost:5000/api/health").then(x => x.json()).catch(() => null);
  assert("Server is reachable", r2?.ok === true, JSON.stringify(r2));
}

async function testAuth() {
  console.log("\n🔐  AUTH");

  // Admin login via username/password
  const r1 = await req("POST", "/auth/login", {
    username: "admin",
    password: "admin123"
  });
  assert("Admin login returns 200",        r1.status === 200,   `status=${r1.status}`);
  assert("Admin login returns token",      !!r1.body?.data?.token, JSON.stringify(r1.body));
  if (r1.body?.data?.token) token = r1.body.data.token;

  // Get /me with valid token
  const r2 = await req("GET", "/auth/me", null, true);
  assert("GET /auth/me returns admin user", r2.body?.data?.role === "admin");

  // Register new farmer
  const r3 = await req("POST", "/auth/register", {
    name    : "Test Farmer",
    email   : `farmer_${Date.now()}@test.lk`,
    password: "test123",
    role    : "farmer",
    district: "Kandy",
    province: "central"
  });
  assert("POST /auth/register returns 201", r3.status === 201, `status=${r3.status}`);
  assert("Register returns token",          !!r3.body?.data?.token);
}

async function testSubmissions() {
  console.log("\n🌾  SUBMISSIONS");

  // Public list
  const r1 = await req("GET", "/submissions");
  assert("GET /submissions returns 200",          r1.status === 200);
  assert("GET /submissions returns data array",   Array.isArray(r1.body?.data?.data));
  assert("Seed data present (>10 submissions)",   (r1.body?.data?.total || 0) > 10,
    `total=${r1.body?.data?.total}`);

  // Filtered by district
  const r2 = await req("GET", "/submissions?district=Kandy");
  assert("GET /submissions?district=Kandy works", r2.status === 200);

  // Filtered by crop
  const r3 = await req("GET", "/submissions?crop=Rice");
  assert("GET /submissions?crop=Rice works",      r3.status === 200);

  // Create (auth required)
  const r4 = await req("POST", "/submissions", {
    farmerName : "Test Farmer",
    district   : "Gampaha",
    province   : "western",
    crop       : "Coconut",
    quantity   : 1500,
    unit       : "kg",
    price      : 120,
    harvestDate: "2026-03-01"
  }, true);
  assert("POST /submissions returns 201",         r4.status === 201, `status=${r4.status}`);
  const newId = r4.body?.data?.id;
  assert("POST /submissions returns id",          !!newId);

  // Get single submission
  if (newId) {
    const r5 = await req("GET", `/submissions/${newId}`);
    assert(`GET /submissions/${newId} returns 200`, r5.status === 200);

    // Update status (admin)
    const r6 = await req("PUT", `/submissions/${newId}/status`, { status: "verified" }, true);
    assert("PUT /submissions/:id/status verified", r6.status === 200 && r6.body?.data?.status === "verified");

    // Delete (admin)
    const r7 = await req("DELETE", `/submissions/${newId}`, null, true);
    assert("DELETE /submissions/:id returns 200",  r7.status === 200);
  }
}

async function testListings() {
  console.log("\n🛒  LISTINGS");

  const r1 = await req("GET", "/listings");
  assert("GET /listings returns 200", r1.status === 200);

  const r2 = await req("POST", "/listings", {
    farmerName : "Test Farmer",
    crop       : "Pineapple",
    quantity   : 500,
    unit       : "kg",
    price      : 180,
    district   : "Colombo",
    province   : "western"
  }, true);
  assert("POST /listings returns 201",      r2.status === 201, `status=${r2.status}`);
  const lid = r2.body?.data?.id;
  assert("POST /listings returns id",       !!lid);

  if (lid) {
    const r3 = await req("GET", `/listings/${lid}`);
    assert(`GET /listings/${lid} returns 200`, r3.status === 200);

    const r4 = await req("PUT", `/listings/${lid}`, { status: "sold" }, true);
    assert("PUT /listings/:id updates status", r4.status === 200);

    const r5 = await req("DELETE", `/listings/${lid}`, null, true);
    assert("DELETE /listings/:id returns 200", r5.status === 200);
  }
}

async function testAlerts() {
  console.log("\n🔔  ALERTS");

  const r1 = await req("GET", "/alerts", null, true);
  assert("GET /alerts returns 200",        r1.status === 200);
  assert("GET /alerts returns array",      Array.isArray(r1.body?.data));

  const r2 = await req("POST", "/alerts", {
    title    : "Test Alert",
    message  : "Smoke test alert",
    severity : "warning"
  }, true);
  assert("POST /alerts returns 201",       r2.status === 201, `status=${r2.status}`);
  const aid = r2.body?.data?.id;

  if (aid) {
    const r3 = await req("PUT", `/alerts/${aid}/read`, null, true);
    assert("PUT /alerts/:id/read marks read", r3.status === 200 && r3.body?.data?.read === true);
  }

  const r4 = await req("PUT", "/alerts/read-all", null, true);
  assert("PUT /alerts/read-all returns 200", r4.status === 200);
}

async function testMap() {
  console.log("\n🗺️   MAP");

  const r1 = await req("GET", "/map/aggregates");
  assert("GET /map/aggregates returns 200",      r1.status === 200);
  assert("GET /map/aggregates returns array",    Array.isArray(r1.body?.data));
  assert("Aggregates have district + status",
    r1.body?.data?.[0]?.district && r1.body?.data?.[0]?.status);

  const r2 = await req("GET", "/map/aggregates?crop=Rice");
  assert("GET /map/aggregates?crop=Rice works",  r2.status === 200);

  const r3 = await req("GET", "/map/districts");
  assert("GET /map/districts returns 200",       r3.status === 200);

  const r4 = await req("GET", "/map/forecast?horizon=2");
  assert("GET /map/forecast?horizon=2 works",    r4.status === 200);
  assert("Forecast trendFactor applied",
    r4.body?.data?.[0]?.horizon === 2);

  const r5 = await req("GET", "/map/crops");
  assert("GET /map/crops returns array",         Array.isArray(r5.body?.data));
}

async function testAdmin() {
  console.log("\n⚙️   ADMIN");

  const r1 = await req("GET", "/admin/stats", null, true);
  assert("GET /admin/stats returns 200",            r1.status === 200);
  assert("Stats has totalSubmissions",              r1.body?.data?.totalSubmissions >= 0);

  const r2 = await req("GET", "/admin/users", null, true);
  assert("GET /admin/users returns 200",            r2.status === 200);
  assert("Users array includes admin",
    Array.isArray(r2.body?.data) && r2.body.data.some(u => u.role === "admin"));

  const r3 = await req("GET", "/admin/activity", null, true);
  assert("GET /admin/activity returns 200",         r3.status === 200);
  assert("Activity has recentSubmissions",          Array.isArray(r3.body?.data?.recentSubmissions));

  // Block unauthenticated access
  const r4 = await req("GET", "/admin/stats");
  assert("GET /admin/stats without token → 401",   r4.status === 401);
}

async function testUsers() {
  console.log("\n👤  USERS");

  const r1 = await req("GET", "/users");
  assert("GET /users returns 200",         r1.status === 200);
  assert("Users summary has total count",  r1.body?.data?.total >= 0);

  const r2 = await req("GET", "/users/me", null, true);
  assert("GET /users/me returns 200",      r2.status === 200);
  assert("Me has role=admin",              r2.body?.data?.role === "admin");

  const r3 = await req("PUT", "/users/me", { district: "Colombo" }, true);
  assert("PUT /users/me updates district", r3.status === 200);
}

// ── RUNNER ────────────────────────────────────────────────────────────────────
(async () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  AgriFlow Backend Smoke Tests");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  await testHealth();
  await testAuth();
  await testSubmissions();
  await testListings();
  await testAlerts();
  await testMap();
  await testAdmin();
  await testUsers();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Results: ${passed} passed  |  ${failed} failed`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  process.exit(failed > 0 ? 1 : 0);
})();
