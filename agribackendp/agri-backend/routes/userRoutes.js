// routes/userRoutes.js
const router = require("express").Router();
const c = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");
const { asyncWrap } = require("../middleware/errorHandler");

// GET  /api/users              — public summary (counts only)
router.get("/",                asyncWrap(c.getSummary));

// GET  /api/users/me           — logged-in user's own profile
router.get("/me",              verifyToken, asyncWrap(c.getMe));

// PUT  /api/users/me           — update own profile
router.put("/me",              verifyToken, asyncWrap(c.updateMe));

// PUT  /api/users/me/password  — change own password
router.put("/me/password",     verifyToken, asyncWrap(c.changePassword));

// GET  /api/users/:id/submissions  — submissions for a specific user
router.get("/:id/submissions", verifyToken, asyncWrap(c.getUserSubmissions));

module.exports = router;
