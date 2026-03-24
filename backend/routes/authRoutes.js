// routes/authRoutes.js
const router = require("express").Router();
const { register, login, me } = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const { asyncWrap } = require("../middleware/errorHandler");

// POST /api/auth/register
router.post("/register", asyncWrap(register));

// POST /api/auth/login
router.post("/login", asyncWrap(login));

// GET /api/auth/me   (protected)
router.get("/me", verifyToken, asyncWrap(me));

module.exports = router;
