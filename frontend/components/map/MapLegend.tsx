// MapLegend - Dynamic legend based on active layer type
'use client';

import { LayerType } from '@/lib/types/map';

interface MapLegendProps {
  activeLayer: LayerType;
}

export default function MapLegend({ activeLayer }: MapLegendProps) {
  return (
    <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/50 w-56 transform transition-all hover:scale-105">
      <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">
        {activeLayer.charAt(0).toUpperCase() + activeLayer.slice(1)} Legend
      </h4>

      {activeLayer === 'market' || activeLayer === 'movement' ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white" />
            <span className="text-xs text-gray-600">Shortage (High Price)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 border border-white" />
            <span className="text-xs text-gray-600">Surplus (Low Price)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 border border-white" />
            <span className="text-xs text-gray-600">Balanced</span>
          </div>
          {activeLayer === 'movement' && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <div className="w-8 h-1 bg-purple-500 border-b-2 border-dashed border-white" />
              <span className="text-xs text-gray-600">Transport Route</span>
            </div>
          )}
        </div>
      ) : activeLayer === 'climate' ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center text-white text-[8px]">
              <i className="fas fa-water" />
            </div>
            <span className="text-xs text-gray-600">Flood Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500 flex items-center justify-center text-white text-[8px]">
              <i className="fas fa-sun" />
            </div>
            <span className="text-xs text-gray-600">Drought Risk</span>
          </div>
        </div>
      ) : activeLayer === 'suitability' ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-700" />
            <span className="text-xs text-gray-600">High Suitability</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-600">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-xs text-gray-600">Low Suitability</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
