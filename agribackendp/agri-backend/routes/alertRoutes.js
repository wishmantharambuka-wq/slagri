// routes/alertRoutes.js
const router = require("express").Router();
const c = require("../controllers/alertController");
const { verifyToken, requireRole } = require("../middleware/auth");
const { asyncWrap } = require("../middleware/errorHandler");

// GET  /api/alerts            — any logged-in user
router.get("/",   verifyToken, asyncWrap(c.list));

// PUT  /api/alerts/read-all   — any logged-in user (must come BEFORE /:id routes)
router.put("/read-all", verifyToken, asyncWrap(c.markAllRead));

// PUT  /api/alerts/:id/read   — any logged-in user
router.put("/:id/read", verifyToken, asyncWrap(c.markRead));

// POST /api/alerts            — admin only
router.post("/",  verifyToken, requireRole("admin"), asyncWrap(c.create));

module.exports = router;
