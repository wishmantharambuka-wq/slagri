/**
 * map-patch.js  —  Live data + GeoJSON choropleth upgrade for map.html
 * ======================================================================
 * Loaded after agri-db.js and the map.html inline script.
 * Patches generateDistrictData() and renderLayer() at runtime —
 * no changes to the original inline script needed.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── LIVE FORECAST CACHE (keyed by crop__horizon) ────────────────────────────
  const _forecastCache = {};

  async function _warmForecastCache(crop, horizon) {
    if (!window.AGRIFLOW_BACKEND_ONLINE || !window.API) return;
    const key = `${crop || 'all'}__${horizon}`;
    if (_forecastCache[key]) return;
    const data = await API.map.forecast({
      crop    : crop && crop !== 'All Crops' ? crop : undefined,
      horizon : horizon
    });
    if (data && data.length) {
      _forecastCache[key] = data;
      console.info(`[map-patch] Forecast cached: ${data.length} districts (${key})`);
    }
  }
  window.warmForecastCache = _warmForecastCache;

  // ── PATCH generateDistrictData ─────────────────────────────────────────────
  // Wraps the original synthetic generator with real API/AgriDB data.
  const _origGenerate = window.generateDistrictData;

  window.generateDistrictData = function(districtObj, crop, horizon) {
    const synthetic = _origGenerate
      ? _origGenerate(districtObj, crop, horizon)
      : {};

    // 1. Check the API forecast cache (populated by _warmForecastCache)
    const cacheKey  = `${crop || 'all'}__${horizon}`;
    const cached    = _forecastCache[cacheKey];
    if (cached) {
      const apiData = cached.find(
        d => d.district.toLowerCase() === (districtObj.name || '').toLowerCase()
      );
      if (apiData) return { ...synthetic, ...apiData, isRealData: true };
    }

    // 2. Fall back to AgriDB aggregates
    if (!window.AgriDB) return synthetic;

    const cropFilter = (crop === 'All Crops') ? null : crop;
    const aggregates = AgriDB.getDistrictAggregates(cropFilter);
    const realData   = aggregates.find(
      a => a.district.toLowerCase() === (districtObj.name || '').toLowerCase()
    );

    if (!realData) return synthetic;

    // Project forward for forecast horizons (simple linear trend)
    const trendFactor = [1, 1.05, 1.12, 1.20][horizon] || 1;
    const projHarvest = Math.round(realData.harvest * trendFactor);
    const projConsume = Math.round(realData.consumption * trendFactor);

    return {
      ...synthetic,
      district    : districtObj.name,
      harvest     : projHarvest,
      consumption : projConsume,
      surplus     : projHarvest - projConsume,
      status      : realData.status,
      risk        : realData.risk || synthetic.risk,
      suitability : realData.suitability || synthetic.suitability,
      price       : {
        current : realData.price.current > 0 ? realData.price.current : (synthetic.price?.current || 0),
        trend   : horizon > 0 ? `+${(horizon * 3)}%` : '0%'
      },
      isRealData  : true
    };
  };

  console.info('[map-patch] generateDistrictData → AgriDB active.');


  // ── GeoJSON CHOROPLETH ─────────────────────────────────────────────────────
  // Public domain Sri Lanka district GeoJSON from GitHub.
  const SL_GEOJSON_URL =
    'https://raw.githubusercontent.com/AnuradhaSK/srilanka-geojson/master/districts.json';

  let _geoLayer = null;

  window.loadGeoJSONLayer = async function(leafletMap, districtData) {
    if (!leafletMap) return;
    if (_geoLayer) { leafletMap.removeLayer(_geoLayer); _geoLayer = null; }

    let geojson;
    try {
      const res = await fetch(SL_GEOJSON_URL);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      geojson = await res.json();
    } catch (err) {
      console.warn('[map-patch] GeoJSON unavailable —', err.message, '— using circle markers.');
      return;
    }

    // Lookup map: district name (lowercase) → aggregate data
    const lookup = {};
    (districtData || []).forEach(d => {
      if (d && d.district) lookup[d.district.toLowerCase()] = d;
    });

    function _color(status, surplus) {
      if (!status) return '#e2e8f0';
      if (status === 'surplus')  return surplus > 5000 ? '#16a34a' : '#4ade80';
      if (status === 'shortage') return '#dc2626';
      return '#f59e0b';
    }

    function _style(feature) {
      const name = (feature.properties.NAME_2 || feature.properties.ADM2_EN || '').toLowerCase();
      const d    = lookup[name];
      return {
        fillColor   : d ? _color(d.status, d.surplus) : '#e2e8f0',
        weight      : 1.5,
        opacity     : 1,
        color       : '#ffffff',
        dashArray   : '',
        fillOpacity : 0.65
      };
    }

    function _onEach(feature, layer) {
      const name = feature.properties.NAME_2 || feature.properties.ADM2_EN || 'District';
      const d    = lookup[name.toLowerCase()];

      const surplusTxt = d
        ? (d.surplus >= 0
            ? `<span style="color:#16a34a;font-weight:700">+${d.surplus.toLocaleString()} kg surplus</span>`
            : `<span style="color:#dc2626;font-weight:700">${Math.abs(d.surplus).toLocaleString()} kg deficit</span>`)
        : '<em style="color:#94a3b8">No data yet</em>';

      const badge = d?.isRealData
        ? '<span style="background:#dcfce7;color:#166534;padding:1px 7px;border-radius:20px;font-size:10px;font-weight:800;margin-left:4px">LIVE</span>'
        : '<span style="background:#fef3c7;color:#92400e;padding:1px 7px;border-radius:20px;font-size:10px;font-weight:800;margin-left:4px">EST</span>';

      layer.bindTooltip(
        `<div style="font-family:Outfit,sans-serif;padding:4px 2px;min-width:150px">
           <div style="font-size:13px;font-weight:800;margin-bottom:5px">${name}${badge}</div>
           <div style="font-size:12px">${surplusTxt}</div>
           ${d ? `<div style="font-size:11px;color:#64748b;margin-top:3px">Harvest: ${d.harvest.toLocaleString()} kg</div>` : ''}
         </div>`,
        { sticky: true, className: 'custom-popup' }
      );

      layer.on({
        mouseover(e) {
          e.target.setStyle({ weight: 3, color: '#1e293b', fillOpacity: 0.85 });
          e.target.bringToFront();
        },
        mouseout() { _geoLayer.resetStyle(layer); },
        click(e) {
          if (d && typeof window.showDistrictDetails === 'function') {
            window.showDistrictDetails(d);
          }
          leafletMap.fitBounds(e.target.getBounds(), { padding: [40, 40] });
        }
      });
    }

    _geoLayer = L.geoJSON(geojson, { style: _style, onEachFeature: _onEach })
                 .addTo(leafletMap);

    console.info('[map-patch] GeoJSON choropleth loaded —', geojson.features?.length, 'districts.');
    return _geoLayer;
  };


  // ── PATCH renderLayer to auto-load GeoJSON on market layer ────────────────
  const _origRenderLayer = window.renderLayer;

  window.renderLayer = async function(type) {
    if (_origRenderLayer) _origRenderLayer(type);

    if (type === 'market' && window.map) {
      // Prefer live API data; fall back to AgriDB localStorage aggregates
      let districtData = window.fullData || [];
      if (window.AGRIFLOW_BACKEND_ONLINE && window.API) {
        const crop   = window.selectedCrop && window.selectedCrop !== 'All Crops'
                       ? window.selectedCrop : null;
        const apiData = await API.map.aggregates(crop ? { crop } : undefined);
        if (apiData && apiData.length) {
          districtData = apiData;
          console.info('[map-patch] District data from API:', apiData.length, 'districts');
        }
      }
      window.loadGeoJSONLayer(window.map, districtData);
    }
  };

  console.info('[map-patch] renderLayer patched — API-aware GeoJSON on market layer.');

});
