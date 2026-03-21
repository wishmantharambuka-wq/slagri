// routes/submissionRoutes.js
const router = require("express").Router();
const c = require("../controllers/submissionController");
const { verifyToken, requireRole } = require("../middleware/auth");
const { asyncWrap } = require("../middleware/errorHandler");

// GET  /api/submissions         — public (map and marketplace read this)
router.get("/",    asyncWrap(c.list));

// GET  /api/submissions/:id     — public
router.get("/:id", asyncWrap(c.getById));

// POST /api/submissions         — any logged-in user (farmer or customer)
router.post("/",   verifyToken, asyncWrap(c.create));

// PUT  /api/submissions/:id/status  — admin only
router.put("/:id/status",
  verifyToken, requireRole("admin"), asyncWrap(c.updateStatus));

// DELETE /api/submissions/:id   — admin only
router.delete("/:id",
  verifyToken, requireRole("admin"), asyncWrap(c.remove));

module.exports = router;
