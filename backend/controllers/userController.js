// controllers/userController.js
const bcrypt   = require("bcryptjs");
const db       = require("../services/store");
const { ok, fail, notFound, forbidden } = require("../utils/response");

// GET /api/users
// Public: returns a summary count of registered users (no private data).
const getSummary = (_req, res) => {
  const users = db.findUsers();
  return ok(res, {
    total    : users.length,
    farmers  : users.filter(u => u.role === "farmer").length,
    customers: users.filter(u => u.role === "customer").length,
  });
};

// GET /api/users/me  (alias — verifyToken required, handled in route)
const getMe = (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) return notFound(res, "User not found.");
  const { passwordHash: _, ...safe } = user;
  return ok(res, safe);
};

// PUT /api/users/me
// Logged-in user updates their own name, district, province.
const updateMe = (req, res) => {
  const allowed = ["name", "district", "province", "phone"];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (Object.keys(updates).length === 0) {
    return fail(res, "No updatable fields provided.");
  }

  const user = db.updateUser(req.user.id, updates);
  if (!user) return notFound(res, "User not found.");
  const { passwordHash: _, ...safe } = user;
  return ok(res, safe, "Profile updated.");
};

// PUT /api/users/me/password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return fail(res, "currentPassword and newPassword are required.");
  }
  if (newPassword.length < 6) {
    return fail(res, "newPassword must be at least 6 characters.");
  }
  const user = db.findUserById(req.user.id);
  if (!user) return notFound(res, "User not found.");

  if (user.passwordHash) {
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) return forbidden(res, "Current password is incorrect.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  db.updateUser(req.user.id, { passwordHash });
  return ok(res, null, "Password changed successfully.");
};

// GET /api/users/:id/submissions
// Any authenticated user can view submissions by a specific farmer ID.
const getUserSubmissions = (req, res) => {
  const user = db.findUserById(req.params.id);
  if (!user) return notFound(res, "User not found.");
  const result = db.findSubmissions({ ...req.query });
  // Filter to this farmer's name
  const filtered = result.data.filter(s => s.farmerName === user.name);
  return ok(res, { data: filtered, total: filtered.length });
};

module.exports = { getSummary, getMe, updateMe, changePassword, getUserSubmissions };
