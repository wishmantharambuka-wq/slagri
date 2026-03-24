// routes/mapRoutes.js
const router = require("express").Router();
const c = require("../controllers/mapController");
const { asyncWrap } = require("../middleware/errorHandler");

// All map routes are public — the map.html page reads these without login.

// GET /api/map/aggregates?crop=Rice
router.get("/aggregates", asyncWrap(c.getAggregates));

// GET /api/map/districts
router.get("/districts", asyncWrap(c.getDistricts));

// GET /api/map/forecast?crop=Rice&horizon=2
router.get("/forecast", asyncWrap(c.getForecast));

// GET /api/map/crops
router.get("/crops", asyncWrap(c.getCrops));

module.exports = router;
