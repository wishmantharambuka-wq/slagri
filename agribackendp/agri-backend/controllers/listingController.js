// controllers/listingController.js
const db  = require("../services/store");
const sse = require("../services/sse");
const { ok, created, fail, notFound, forbidden } = require("../utils/response");
const { validateListing } = require("../utils/validators");

// GET /api/listings
const list = (req, res) => {
  const result = db.findListings(req.query);
  return ok(res, result);
};

// GET /api/listings/:id
const getById = (req, res) => {
  const listing = db.findListingById(req.params.id);
  if (!listing) return notFound(res, "Listing not found.");
  return ok(res, listing);
};

// POST /api/listings
const create = (req, res) => {
  const errors = validateListing(req.body);
  if (errors.length) return fail(res, "Validation failed", 400, errors);

  const farmerName = req.body.farmerName || req.user?.name || "Anonymous";
  const listing = db.createListing({ ...req.body, farmerName });
  sse.emit("listing.created", { id: listing.id, crop: listing.crop, district: listing.district, price: listing.price });
  sse.emit("kpi.updated", db.getKPIs());
  return created(res, listing, "Listing published.");
};

// PUT /api/listings/:id
const update = (req, res) => {
  const existing = db.findListingById(req.params.id);
  if (!existing) return notFound(res, "Listing not found.");

  // Only owner or admin can update
  const isOwner = existing.farmerName === req.user?.name;
  const isAdmin = req.user?.role === "admin";
  if (!isOwner && !isAdmin) return forbidden(res, "You can only edit your own listings.");

  const listing = db.updateListing(req.params.id, req.body);
  return ok(res, listing, "Listing updated.");
};

// DELETE /api/listings/:id
const remove = (req, res) => {
  const existing = db.findListingById(req.params.id);
  if (!existing) return notFound(res, "Listing not found.");

  const isOwner = existing.farmerName === req.user?.name;
  const isAdmin = req.user?.role === "admin";
  if (!isOwner && !isAdmin) return forbidden(res, "You can only delete your own listings.");

  db.deleteListing(req.params.id);
  return ok(res, null, "Listing removed.");
};

module.exports = { list, getById, create, update, remove };
