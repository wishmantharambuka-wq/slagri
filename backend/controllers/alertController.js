// controllers/alertController.js
const db  = require("../services/store");
const sse = require("../services/sse");
const { ok, created, fail, notFound } = require("../utils/response");
const { validateAlert } = require("../utils/validators");

// GET /api/alerts
const list = (req, res) => {
  const alerts = db.findAlerts({
    unread   : req.query.unread === "true",
    severity : req.query.severity,
  });
  return ok(res, alerts);
};

// POST /api/alerts   (admin only)
const create = (req, res) => {
  const errors = validateAlert(req.body);
  if (errors.length) return fail(res, "Validation failed", 400, errors);
  const alert = db.createAlert(req.body);
  sse.emit("alert.created", { id: alert.id, title: alert.title, severity: alert.severity });
  return created(res, alert);
};

// PUT /api/alerts/:id/read
const markRead = (req, res) => {
  const alert = db.markAlertRead(req.params.id);
  if (!alert) return notFound(res, "Alert not found.");
  return ok(res, alert, "Alert marked as read.");
};

// PUT /api/alerts/read-all
const markAllRead = (req, res) => {
  db.markAllAlertsRead();
  return ok(res, null, "All alerts marked as read.");
};

module.exports = { list, create, markRead, markAllRead };
