// useMapLayers - Hook for managing map layer visibility state
'use client';

import { useState, useCallback } from 'react';
import { LayerType, LAYER_CONFIG } from '@/lib/types/map';

interface UseMapLayersReturn {
  activeLayer: LayerType;
  setActiveLayer: (layer: LayerType) => void;
  isLayerVisible: (layer: LayerType) => boolean;
  toggleLayer: (layer: LayerType) => void;
}

export function useMapLayers(): UseMapLayersReturn {
  const [activeLayer, setActiveLayerState] = useState<LayerType>('market');

  const setActiveLayer = useCallback((layer: LayerType) => {
    setActiveLayerState(layer);
  }, []);

  const isLayerVisible = useCallback(
    (layer: LayerType) => {
      return LAYER_CONFIG[layer].visible || layer === activeLayer;
    },
    [activeLayer]
  );

  const toggleLayer = useCallback((layer: LayerType) => {
    setActiveLayerState(layer);
  }, []);

  return {
    activeLayer,
    setActiveLayer,
    isLayerVisible,
    toggleLayer,
  };
}
