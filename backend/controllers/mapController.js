// controllers/mapController.js
const db = require("../services/store");
const { ok } = require("../utils/response");

// GET /api/map/aggregates?crop=Rice
// Returns per-district surplus/shortage aggregates for the map layer.
const getAggregates = (req, res) => {
  const { crop } = req.query;
  const data = db.getDistrictAggregates(crop || null);
  return ok(res, data);
};

// GET /api/map/districts
// Returns a flat list of all districts that have at least one submission,
// with a summary count so the map sidebar can be populated.
const getDistricts = (req, res) => {
  const agg = db.getDistrictAggregates(null);
  const districts = agg.map(d => ({
    district  : d.district,
    province  : d.province,
    status    : d.status,
    count     : d.count,
  }));
  return ok(res, districts);
};

// GET /api/map/forecast?crop=Rice&horizon=2
// Projects district aggregates forward using a simple linear trend.
// horizon: 0 = now, 1 = +1 month, 2 = +2 months, 3 = +3 months
const getForecast = (req, res) => {
  const crop    = req.query.crop    || null;
  const horizon = parseInt(req.query.horizon || 0);
  const base    = db.getDistrictAggregates(crop);

  // Trend multipliers per horizon step
  const TREND = [1.00, 1.05, 1.12, 1.20];
  const factor = TREND[Math.min(horizon, 3)];

  const projected = base.map(d => {
    const harvest     = Math.round(d.harvest     * factor);
    const consumption = Math.round(d.consumption * factor);
    const surplus     = harvest - consumption;
    return {
      ...d,
      harvest,
      consumption,
      surplus,
      status      : surplus > 0 ? "surplus" : surplus < -10 ? "shortage" : "stable",
      horizon,
      priceTrend  : horizon > 0 ? `+${(horizon * 3)}%` : "0%",
    };
  });

  return ok(res, projected);
};

// GET /api/map/crops
// Returns the list of distinct crops available in submissions.
const getCrops = (req, res) => {
  const subs  = db.findSubmissions({ limit: 1000 }).data;
  const crops = [...new Set(subs.map(s => s.crop).filter(Boolean))].sort();
  return ok(res, crops);
};

module.exports = { getAggregates, getDistricts, getForecast, getCrops };
