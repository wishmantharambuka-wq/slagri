// controllers/adminController.js
const db = require("../services/store");
const { ok, notFound, fail } = require("../utils/response");

// GET /api/admin/stats
// Returns the full KPI dashboard summary.
const getStats = (_req, res) => {
  const kpis = db.getKPIs();
  return ok(res, kpis);
};

// GET /api/admin/users
// Returns all users with optional filters: role, status, q (search).
const getUsers = (req, res) => {
  const users = db.findUsers(req.query);
  // Strip password hashes from response
  const safe = users.map(({ passwordHash: _, ...u }) => u);
  return ok(res, safe);
};

// GET /api/admin/users/:id
const getUserById = (req, res) => {
  const user = db.findUserById(req.params.id);
  if (!user) return notFound(res, "User not found.");
  const { passwordHash: _, ...safe } = user;
  return ok(res, safe);
};

// PUT /api/admin/users/:id/status
// Approve, suspend, or reactivate a user account.
const updateUserStatus = (req, res) => {
  const { status } = req.body;
  const validStatuses = ["active", "suspended", "pending"];
  if (!validStatuses.includes(status)) {
    return fail(res, `status must be one of: ${validStatuses.join(", ")}`);
  }
  const user = db.updateUser(req.params.id, { status });
  if (!user) return notFound(res, "User not found.");
  const { passwordHash: _, ...safe } = user;
  return ok(res, safe, `User status updated to '${status}'.`);
};

// GET /api/admin/submissions
// Admin view: all submissions, all statuses, pagination.
const getSubmissions = (req, res) => {
  const result = db.findSubmissions(req.query);
  return ok(res, result);
};

// GET /api/admin/activity
// Returns a simple activity log (last 20 submissions + last 10 alerts).
const getActivity = (_req, res) => {
  const subs   = db.findSubmissions({ limit: 20 }).data;
  const alerts = db.findAlerts({}).slice(0, 10);
  return ok(res, {
    recentSubmissions : subs,
    recentAlerts      : alerts,
  });
};

module.exports = { getStats, getUsers, getUserById, updateUserStatus, getSubmissions, getActivity };
