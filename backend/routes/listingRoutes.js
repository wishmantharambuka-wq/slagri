// routes/listingRoutes.js
const router = require("express").Router();
const c = require("../controllers/listingController");
const { verifyToken } = require("../middleware/auth");
const { asyncWrap } = require("../middleware/errorHandler");

// GET  /api/listings         — public (marketplace reads this)
router.get("/",    asyncWrap(c.list));

// GET  /api/listings/:id     — public
router.get("/:id", asyncWrap(c.getById));

// POST /api/listings         — any logged-in user
router.post("/",   verifyToken, asyncWrap(c.create));

// PUT  /api/listings/:id     — owner or admin
router.put("/:id", verifyToken, asyncWrap(c.update));

// DELETE /api/listings/:id  — owner or admin
router.delete("/:id", verifyToken, asyncWrap(c.remove));

module.exports = router;
