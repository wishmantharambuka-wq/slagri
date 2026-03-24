// controllers/submissionController.js
const db  = require("../services/store");
const sse = require("../services/sse");
const { ok, created, fail, notFound } = require("../utils/response");
const { validateSubmission } = require("../utils/validators");

// GET /api/submissions
const list = (req, res) => {
  const result = db.findSubmissions(req.query);
  return ok(res, result);
};

// GET /api/submissions/:id
const getById = (req, res) => {
  const sub = db.findSubmissionById(req.params.id);
  if (!sub) return notFound(res, "Submission not found.");
  return ok(res, sub);
};

// POST /api/submissions
const create = (req, res) => {
  const errors = validateSubmission(req.body);
  if (errors.length) return fail(res, "Validation failed", 400, errors);

  // Attach authenticated user info if available
  const farmerName = req.body.farmerName || req.user?.name || "Anonymous";
  const sub = db.createSubmission({ ...req.body, farmerName });
  sse.emit("submission.created", { id: sub.id, district: sub.district, crop: sub.crop, quantity: sub.quantity });
  sse.emit("kpi.updated", db.getKPIs());
  return created(res, sub, "Submission recorded successfully.");
};

// PUT /api/submissions/:id/status   (admin only)
const updateStatus = (req, res) => {
  const { status } = req.body;
  const validStatuses = ["pending", "verified", "rejected"];
  if (!validStatuses.includes(status)) {
    return fail(res, `status must be one of: ${validStatuses.join(", ")}`);
  }
  const sub = db.updateSubmission(req.params.id, { status });
  if (!sub) return notFound(res, "Submission not found.");
  sse.emit("submission.updated", { id: sub.id, status });
  sse.emit("kpi.updated", db.getKPIs());
  return ok(res, sub, `Submission marked as ${status}.`);
};

// DELETE /api/submissions/:id   (admin only)
const remove = (req, res) => {
  const deleted = db.deleteSubmission(req.params.id);
  if (!deleted) return notFound(res, "Submission not found.");
  return ok(res, null, "Submission deleted.");
};

module.exports = { list, getById, create, updateStatus, remove };
