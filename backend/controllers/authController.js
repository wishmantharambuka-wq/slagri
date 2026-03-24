// controllers/authController.js
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const db      = require("../services/store");
const { ok, created, fail, unauthorized } = require("../utils/response");
const { validateRegister } = require("../utils/validators");

// POST /api/auth/register
const register = async (req, res) => {
  const errors = validateRegister(req.body);
  if (errors.length) return fail(res, "Validation failed", 400, errors);

  const { name, email, password, role = "farmer", district, province } = req.body;

  if (db.findUserByEmail(email)) {
    return fail(res, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = db.createUser({ name, email, passwordHash, role, district, province });

  const token = _signToken(user);
  const { passwordHash: _, ...safe } = user;
  return created(res, { user: safe, token }, "Registration successful.");
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password, username, role } = req.body;

  // Admin shortcut: username/password from .env (legacy support)
  if (username && password) {
    if (
      username === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASS
    ) {
      const adminUser = { id: "admin_env", name: "Administrator", role: "admin", email: "admin@agriflow.lk" };
      return ok(res, { user: adminUser, token: _signToken(adminUser) }, "Admin login successful.");
    }
    return unauthorized(res, "Invalid credentials.");
  }

  // Role-based quick login (no password — used by farmer/customer registration flow)
  if (role && !email) {
    const name  = req.body.name || (role === "farmer" ? "Farmer" : "Customer");
    const guest = db.createUser({ name, email: `guest_${Date.now()}@agriflow.lk`, role, passwordHash: "" });
    const token = _signToken(guest);
    const { passwordHash: _, ...safe } = guest;
    return ok(res, { user: safe, token }, "Logged in successfully.");
  }

  // Standard email + password login
  if (!email || !password) return fail(res, "Email and password are required.");
  const user = db.findUserByEmail(email);
  if (!user || !user.passwordHash) return unauthorized(res, "Invalid email or password.");

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return unauthorized(res, "Invalid email or password.");

  const token = _signToken(user);
  const { passwordHash: _, ...safe } = user;
  return ok(res, { user: safe, token }, "Login successful.");
};

// GET /api/auth/me
const me = (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) return unauthorized(res, "User not found.");
  const { passwordHash: _, ...safe } = user;
  return ok(res, safe);
};

// ── HELPER ─────────────────────────────────────────────────────────────────
function _signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

module.exports = { register, login, me };
