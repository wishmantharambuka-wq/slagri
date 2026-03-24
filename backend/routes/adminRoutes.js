// routes/adminRoutes.js
const router = require("express").Router();
const c = require("../controllers/adminController");
const { verifyToken, requireRole } = require("../middleware/auth");
const { asyncWrap } = require("../middleware/errorHandler");

// All admin routes require a valid token with role === "admin".
const guard = [verifyToken, requireRole("admin")];

// GET  /api/admin/stats
router.get("/stats",               ...guard, asyncWrap(c.getStats));

// GET  /api/admin/users
router.get("/users",               ...guard, asyncWrap(c.getUsers));

// GET  /api/admin/users/:id
router.get("/users/:id",           ...guard, asyncWrap(c.getUserById));

// PUT  /api/admin/users/:id/status
router.put("/users/:id/status",    ...guard, asyncWrap(c.updateUserStatus));

// GET  /api/admin/submissions
router.get("/submissions",         ...guard, asyncWrap(c.getSubmissions));

// GET  /api/admin/activity
router.get("/activity",            ...guard, asyncWrap(c.getActivity));

module.exports = router;
