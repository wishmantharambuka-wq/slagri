// middleware/errorHandler.js  —  Global error handler
// ======================================================
// Catches any error thrown from controllers via next(err) or
// synchronous throws inside async handlers.

const errorHandler = (err, req, res, _next) => {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (process.env.NODE_ENV !== "production") {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}: ${message}`);
    if (err.stack) console.error(err.stack);
  }

  return res.status(status).json({
    success : false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

/**
 * Wraps async route handlers so unhandled promise rejections
 * are forwarded to the error handler instead of crashing the server.
 * Usage: router.get("/path", asyncWrap(async (req, res) => { ... }))
 */
const asyncWrap = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncWrap };
