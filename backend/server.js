// server.js  —  AgriFlow API Server
// ==================================
// Start:  node server.js
// Or:     npm run dev   (with nodemon)
//
// Works immediately with zero npm installs — uses only built-in Node.js
// modules plus the already-installed: express, cors, dotenv, bcryptjs,
// jsonwebtoken, multer.
//
// Optional packages (gracefully skipped if not installed):
//   morgan            — HTTP request logging     → npm install morgan
//   helmet            — Security headers          → npm install helmet
//   express-rate-limit — Rate limiting            → npm install express-rate-limit
//
// Endpoints:
//   POST   /api/auth/login            POST   /api/auth/register
//   GET    /api/auth/me               GET    /api/submissions
//   POST   /api/submissions           PUT    /api/submissions/:id/status
//   DELETE /api/submissions/:id       GET    /api/listings
//   POST   /api/listings              PUT    /api/listings/:id
//   DELETE /api/listings/:id          GET    /api/alerts
//   POST   /api/alerts                PUT    /api/alerts/:id/read
//   PUT    /api/alerts/read-all       GET    /api/map/aggregates
//   GET    /api/map/districts         GET    /api/map/forecast
//   GET    /api/map/crops             GET    /api/admin/stats
//   GET    /api/admin/users           PUT    /api/admin/users/:id/status
//   GET    /api/admin/submissions     GET    /api/admin/activity
//   GET    /api/users                 GET    /api/users/me
//   PUT    /api/users/me              PUT    /api/users/me/password

require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRoutes        = require("./routes/authRoutes");
const submissionRoutes  = require("./routes/submissionRoutes");
const listingRoutes     = require("./routes/listingRoutes");
const alertRoutes       = require("./routes/alertRoutes");
const mapRoutes         = require("./routes/mapRoutes");
const adminRoutes       = require("./routes/adminRoutes");
const userRoutes        = require("./routes/userRoutes");
const sseRoutes         = require("./routes/sseRoutes");
const { errorHandler }  = require("./middleware/errorHandler");

const app = express();

// ── OPTIONAL: SECURITY HEADERS (helmet) ──────────────────────────────────────
try {
  const helmet = require("helmet");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  console.log("✅ helmet loaded");
} catch {
  console.warn("⚠️  helmet not installed — run: npm install helmet");
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",   // VS Code Live Server default
  "http://localhost:5500",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, curl, same-origin)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── OPTIONAL: RATE LIMITING ───────────────────────────────────────────────────
try {
  const rateLimit = require("express-rate-limit");
  app.use(rateLimit({
    windowMs : 15 * 60 * 1000,   // 15 minutes
    max      : 200,
    message  : { error: "Too many requests — try again later." }
  }));
  console.log("✅ rate-limit loaded");
} catch {
  console.warn("⚠️  express-rate-limit not installed — run: npm install express-rate-limit");
}

// ── PARSING ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ── OPTIONAL: HTTP LOGGING (morgan) ───────────────────────────────────────────
try {
  const morgan = require("morgan");
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  console.log("✅ morgan loaded");
} catch {
  // Minimal built-in logger fallback
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString().slice(11,19)} ${req.method} ${req.path}`);
    next();
  });
}

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/listings",    listingRoutes);
app.use("/api/alerts",      alertRoutes);
app.use("/api/map",         mapRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api/users",       userRoutes);
app.use("/api/events",      sseRoutes);   // Server-Sent Events

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    service : "AgriFlow API",
    version : "1.0.0",
    status  : "running",
    dbMode  : process.env.DB_MODE || "memory",
    time    : new Date().toISOString()
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()) + "s" });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── START ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌿 AgriFlow API  →  http://localhost:${PORT}`);
  console.log(`   Mode : ${process.env.NODE_ENV || "development"}`);
  console.log(`   DB   : ${process.env.DB_MODE  || "memory (in-process)"}\n`);
});

module.exports = app;
