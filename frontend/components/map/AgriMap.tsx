// AgriMap - Leaflet map component with useRef and useEffect
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { DistrictData } from '@/lib/types/crops';
import { LayerType, MAP_CONFIG, getMarkerStyle } from '@/lib/types/map';
import { MAP_TILE_URL } from '@/lib/constants/config';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Declare L as global from CDN
declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

interface AgriMapProps {
  districts: DistrictData[];
  activeLayer: LayerType;
  onDistrictSelect: (district: DistrictData) => void;
  selectedDistrict: DistrictData | null;
  className?: string;
}

export default function AgriMap({
  districts,
  activeLayer,
  onDistrictSelect,
  selectedDistrict,
  className = '',
}: AgriMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const movementLayerRef = useRef<L.LayerGroup | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map on client-side only
  useEffect(() => {
    setIsClient(true);

    // Wait for Leaflet to be available
    const initMap = () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      if (typeof window.L === 'undefined') {
        console.warn('Leaflet not loaded yet, retrying...');
        setTimeout(initMap, 100);
        return;
      }

      const L = window.L;

      try {
        // Create map instance
        const map = L.map(mapContainerRef.current, {
          center: MAP_CONFIG.center,
          zoom: MAP_CONFIG.zoom,
          minZoom: MAP_CONFIG.minZoom,
          maxZoom: MAP_CONFIG.maxZoom,
          zoomControl: false,
          attributionControl: false,
        });

        // Add tile layer
        L.tileLayer(MAP_TILE_URL, {
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map);

        // Add zoom control to bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Create layer groups
        markersLayerRef.current = L.layerGroup().addTo(map);
        movementLayerRef.current = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;
        setIsMapReady(true);

        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Small delay to ensure container is rendered
    const timer = setTimeout(initMap, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render markers when districts or active layer changes
  const renderMarkers = useCallback(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current || !isMapReady) return;
    if (typeof window.L === 'undefined') return;

    const L = window.L;
    markersLayerRef.current.clearLayers();
    movementLayerRef.current?.clearLayers();

    districts.forEach((district) => {
      const style = getMarkerStyle(district, activeLayer);
      const rgb = hexToRgb(style.color);

      const markerHtml = `
        <div class="${style.className}" style="
          background-color: ${style.color};
          width: ${style.radius * 2}px;
          height: ${style.radius * 2}px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0.9;
          ${style.className === 'marker-pulse' ? `--rgb: ${rgb};` : ''}
        ">
          ${activeLayer === 'climate' && district.risk?.flood ? '<i class="fas fa-water" style="color:white;font-size:10px;"></i>' : ''}
          ${activeLayer === 'climate' && district.risk?.drought ? '<i class="fas fa-sun" style="color:white;font-size:10px;"></i>' : ''}
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: markerHtml,
        iconSize: [style.radius * 2, style.radius * 2],
        iconAnchor: [style.radius, style.radius],
      });

      const marker = L.marker(district.coords, { icon });

      marker.on('click', () => {
        onDistrictSelect(district);
        mapInstanceRef.current?.flyTo(district.coords, 9, { duration: 1 });
      });

      marker.addTo(markersLayerRef.current!);
    });

    // Render movement lines for 'movement' layer
    if (activeLayer === 'movement') {
      renderMovementLines(districts);
    }
  }, [districts, activeLayer, onDistrictSelect, isMapReady]);

  // Calculate and render movement transport lines
  const renderMovementLines = useCallback((districts: DistrictData[]) => {
    if (!movementLayerRef.current || typeof window.L === 'undefined') return;

    const L = window.L;
    const surplusNodes = districts
      .filter((d) => d.status === 'surplus')
      .sort((a, b) => b.surplus - a.surplus);
    const shortageNodes = districts
      .filter((d) => d.status === 'shortage')
      .sort((a, b) => a.surplus - b.surplus);

    shortageNodes.forEach((short) => {
      // Find the closest surplus source to this shortage district
      let bestSource: DistrictData | undefined;
      let minDist = Infinity;

      for (const surp of surplusNodes) {
        if (surp.surplus <= 0) continue;
        const dist = Math.sqrt(
          Math.pow(short.coords[0] - surp.coords[0], 2) + Math.pow(short.coords[1] - surp.coords[1], 2)
        );
        if (dist < minDist) {
          minDist = dist;
          bestSource = surp;
        }
      }

      if (bestSource) {
        const latlngs: L.LatLng[] = [
          L.latLng(bestSource.coords[0], bestSource.coords[1]),
          L.latLng(short.coords[0], short.coords[1]),
        ];

        L.polyline(latlngs, {
          color: '#8B5CF6',
          weight: 3,
          opacity: 0.8,
          className: 'transport-line',
        }).addTo(movementLayerRef.current!);

        L.marker(short.coords, {
          icon: L.divIcon({
            html: '<i class="fas fa-caret-down text-purple-600 text-2xl"></i>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
        }).addTo(movementLayerRef.current!);

        // Mark surplus as used (simple deduction for visualization)
        bestSource.surplus -= 1000;
      }
    });
  }, []);

  // Re-render markers when data changes
  useEffect(() => {
    if (isClient && districts.length > 0 && isMapReady) {
      renderMarkers();
    }
  }, [isClient, districts, activeLayer, isMapReady, renderMarkers]);

  // Fly to selected district
  useEffect(() => {
    if (selectedDistrict && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selectedDistrict.coords, 9, { duration: 1 });
    }
  }, [selectedDistrict]);

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className={`w-full h-full bg-slate-200 animate-pulse flex items-center justify-center ${className}`}>
        <span className="text-gray-400">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" style={{ height: '100%', minHeight: '500px' }}>
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        id="map-container"
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-2xl">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-sm text-gray-500">Initializing map...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to convert hex color to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}
