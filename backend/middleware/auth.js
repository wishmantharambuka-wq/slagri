// middleware/auth.js  —  JWT verification + role guard
// ======================================================

const jwt = require("jsonwebtoken");
const { unauthorized, forbidden } = require("../utils/response");

/**
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches decoded payload to req.user.
 */
const verifyToken = (req, res, next) => {
  const header = req.headers["authorization"] || req.headers["Authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized(res, "No token provided.");
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return unauthorized(res, "Invalid or expired token.");
  }
};

/**
 * Factory that returns middleware enforcing a specific role.
 * Usage: router.get("/admin/stats", verifyToken, requireRole("admin"), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return unauthorized(res);
  if (!roles.includes(req.user.role)) {
    return forbidden(res, `Requires role: ${roles.join(" or ")}`);
  }
  next();
};

module.exports = { verifyToken, requireRole };
