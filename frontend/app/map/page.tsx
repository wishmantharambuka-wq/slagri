// Map Page - Interactive GIS visualization with Leaflet
'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { LayerType } from '@/lib/types/map';
import { DistrictData } from '@/lib/types/crops';
import { useUrbanData } from '@/lib/hooks/useUrbanData';
import { useMapLayers } from '@/lib/hooks/useMapLayers';
import MapControls from '@/components/map/MapControls';
import MapLegend from '@/components/map/MapLegend';
import DistrictPanel from '@/components/dashboard/DistrictPanel';

// Dynamic import for AgriMap (client-side only, no SSR)
const AgriMap = dynamic(() => import('@/components/map/AgriMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse rounded-2xl" />
  ),
});

export default function MapPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [horizon, setHorizon] = useState(0);

  const { activeLayer, setActiveLayer } = useMapLayers();
  const { data: districts, isLoading } = useUrbanData({
    crop: selectedCrop,
    horizon,
    layer: activeLayer,
  });

  const handleDistrictSelect = useCallback((district: DistrictData) => {
    setSelectedDistrict(district);
  }, []);

  const handleLayerChange = useCallback((layer: LayerType) => {
    setActiveLayer(layer);
  }, [setActiveLayer]);

  const handleCropChange = useCallback((crop: string) => {
    setSelectedCrop(crop);
  }, []);

  const handleHorizonChange = useCallback((h: number) => {
    setHorizon(h);
  }, []);

  return (
    <div className="flex-grow flex flex-col lg:flex-row overflow-hidden p-4 gap-4 relative h-[calc(100vh-64px)]">
      {/* LEFT PANEL: Layers & Regions */}
      <div className="w-full lg:w-72 flex-shrink-0 h-full overflow-hidden z-20">
        <div className="w-full h-full glass-panel rounded-2xl flex flex-col overflow-hidden">
          {/* Layer Buttons */}
          <div className="p-4 border-b border-gray-200 bg-white/30">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Intelligence Overlays
            </h3>
            <div className="space-y-2">
              {(['market', 'climate', 'suitability', 'movement'] as LayerType[]).map((layer) => {
                const icons: Record<LayerType, string> = {
                  market: 'fa-chart-pie',
                  climate: 'fa-cloud-showers-heavy',
                  suitability: 'fa-layer-group',
                  movement: 'fa-truck-moving',
                };
                const colors: Record<LayerType, string> = {
                  market: 'green',
                  climate: 'blue',
                  suitability: 'yellow',
                  movement: 'purple',
                };
                const isActive = activeLayer === layer;
                return (
                  <button
                    key={layer}
                    onClick={() => handleLayerChange(layer)}
                    className={`
                      w-full text-left px-4 py-3 rounded-xl border flex items-center gap-3 transition-all
                      ${isActive
                        ? 'bg-white border-white shadow-md'
                        : 'bg-white/50 border-transparent hover:bg-white/80'
                      }
                    `}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-${colors[layer]}-100 text-${colors[layer]}-600 flex items-center justify-center`}
                    >
                      <i className={`fas ${icons[layer]}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800">
                        {layer.charAt(0).toUpperCase() + layer.slice(1)} Status
                      </div>
                      <div className="text-[9px] text-gray-500 opacity-70">
                        {layer === 'market' && 'Surplus / Shortage'}
                        {layer === 'climate' && 'Flood / Drought'}
                        {layer === 'suitability' && 'Soil / Water / Elev'}
                        {layer === 'movement' && 'Transport Logic'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Crop Filter */}
          <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Crop Filter
            </h3>
            <div className="space-y-1">
              {['Paddy', 'Vegetables', 'Fruits', 'Tea', 'Coconut'].map((crop) => (
                <button
                  key={crop}
                  onClick={() => handleCropChange(crop)}
                  className={`
                    w-full text-left px-4 py-2 rounded-lg flex items-center justify-between
                    transition-all text-xs font-medium
                    ${selectedCrop === crop
                      ? 'bg-white shadow-sm text-orange-600 font-bold'
                      : 'text-gray-600 hover:bg-white/60'
                    }
                  `}
                >
                  <span>{crop}</span>
                  {selectedCrop === crop && (
                    <i className="fas fa-check text-[10px] text-orange-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CENTER PANEL: Map */}
      <div className="flex-grow glass-panel rounded-2xl relative overflow-hidden shadow-xl" style={{ minHeight: '500px' }}>
        {/* Map Controls Overlay */}
        <MapControls
          activeLayer={activeLayer}
          onLayerChange={handleLayerChange}
          selectedCrop={selectedCrop}
          onCropChange={handleCropChange}
          horizon={horizon}
          onHorizonChange={handleHorizonChange}
        />

        {/* Legend Overlay */}
        <MapLegend activeLayer={activeLayer} />

        {/* Map Container */}
        <div className="absolute inset-0 pt-16 pb-4 px-4">
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner bg-slate-200">
            <AgriMap
              districts={districts}
              activeLayer={activeLayer}
              onDistrictSelect={handleDistrictSelect}
              selectedDistrict={selectedDistrict}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-[1001]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-gray-600">Loading district data...</span>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: District Details */}
      <div className="w-full lg:w-80 flex-shrink-0 h-full overflow-hidden">
        <DistrictPanel
          district={selectedDistrict}
          crop={selectedCrop}
          horizon={horizon}
        />
      </div>
    </div>
  );
}
