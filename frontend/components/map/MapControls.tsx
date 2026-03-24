// MapControls - Layer toggle buttons and forecast horizon controls
'use client';

import { LayerType, LAYER_CONFIG } from '@/lib/types/map';
import { CROP_TYPES } from '@/lib/types/crops';

interface MapControlsProps {
  activeLayer: LayerType;
  onLayerChange: (layer: LayerType) => void;
  selectedCrop: string;
  onCropChange: (crop: string) => void;
  horizon: number;
  onHorizonChange: (horizon: number) => void;
}

export default function MapControls({
  activeLayer,
  onLayerChange,
  selectedCrop,
  onCropChange,
  horizon,
  onHorizonChange,
}: MapControlsProps) {
  const layers: LayerType[] = ['market', 'climate', 'suitability', 'movement'];

  return (
    <>
      {/* Crop Selector */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/80 backdrop-blur-md rounded-xl border border-white shadow-sm">
        <select
          value={selectedCrop}
          onChange={(e) => onCropChange(e.target.value)}
          className="px-4 py-3 rounded-xl text-lg font-extrabold text-gray-800 bg-transparent border-none focus:outline-none cursor-pointer"
        >
          {CROP_TYPES.map((crop) => (
            <option key={crop} value={crop}>
              {crop}
            </option>
          ))}
        </select>
      </div>

      {/* Forecast Horizon Controls */}
      <div className="absolute top-4 left-[200px] z-[1000] bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white shadow-sm">
        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">AI Forecast Horizon</span>
        <div className="flex gap-1 bg-gray-100/50 p-1 rounded-lg">
          {[0, 1, 2, 3].map((h) => (
            <button
              key={h}
              onClick={() => onHorizonChange(h)}
              className={`
                flex-1 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition
                ${horizon === h ? 'bg-gray-800 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-white'}
              `}
            >
              {h === 0 ? 'Now' : `+${h}M`}
            </button>
          ))}
        </div>
      </div>

      {/* Layer Toggle Buttons */}
      <div className="absolute top-[88px] left-4 z-[1000] flex flex-col gap-2">
        {layers.map((layer) => {
          const config = LAYER_CONFIG[layer];
          const isActive = activeLayer === layer;
          return (
            <button
              key={layer}
              onClick={() => onLayerChange(layer)}
              className={`
                w-full text-left px-4 py-3 rounded-xl border flex items-center gap-3 transition-all
                ${isActive
                  ? 'bg-white border-white shadow-md'
                  : 'bg-white/50 border-transparent hover:bg-white/80'
                }
              `}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${config.color}20`, color: config.color }}
              >
                <i className={`fas ${config.icon}`} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">{config.label}</div>
                <div className="text-[9px] text-gray-500 opacity-70">{config.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
