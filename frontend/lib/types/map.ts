// Map configuration and layer types

export type LayerType = 'market' | 'climate' | 'suitability' | 'movement';

export interface MapConfig {
  center: [number, number]; // Sri Lanka: [7.8731, 80.7718]
  zoom: number;
  minZoom: number;
  maxZoom: number;
}

export interface MapLayer {
  id: LayerType;
  label: string;
  icon: string; // FontAwesome class
  color: string;
  description: string;
  visible: boolean;
}

export const MAP_CONFIG: MapConfig = {
  center: [7.8731, 80.7718],
  zoom: 7.5,
  minZoom: 6,
  maxZoom: 18,
};

export const LAYER_CONFIG: Record<LayerType, MapLayer> = {
  market: {
    id: 'market',
    label: 'Market Status',
    icon: 'fa-chart-pie',
    color: '#10B981',
    description: 'Surplus / Shortage indicators',
    visible: true,
  },
  climate: {
    id: 'climate',
    label: 'Climate Risk',
    icon: 'fa-cloud-showers-heavy',
    color: '#3B82F6',
    description: 'Flood / Drought risk zones',
    visible: false,
  },
  suitability: {
    id: 'suitability',
    label: 'Land Suitability',
    icon: 'fa-layer-group',
    color: '#F59E0B',
    description: 'Soil / Water / Elevation analysis',
    visible: false,
  },
  movement: {
    id: 'movement',
    label: 'National Plan',
    icon: 'fa-truck-moving',
    color: '#8B5CF6',
    description: 'Transport logistics & redistribution',
    visible: false,
  },
};

// Marker styling helper
export interface MarkerStyle {
  color: string;
  radius: number;
  iconHtml: string;
  className: string;
}

export function getMarkerStyle(
  district: { status?: string; risk?: { flood?: boolean; drought?: boolean }; suitability?: { score?: number } },
  layerType: LayerType
): MarkerStyle {
  let color = '#9CA3AF';
  let radius = 8;
  let className = '';

  if (layerType === 'market' || layerType === 'movement') {
    if (district.status === 'surplus') {
      color = '#10B981';
      radius = 10 + Math.abs((district as { surplus?: number }).surplus ?? 0) / 5000;
      className = 'marker-pulse';
    } else if (district.status === 'shortage') {
      color = '#EF4444';
      radius = 10 + Math.abs((district as { surplus?: number }).surplus ?? 0) / 2000;
      className = 'marker-pulse';
    } else {
      color = '#F59E0B';
      radius = 8;
    }
  } else if (layerType === 'climate') {
    if (district.risk?.flood) {
      color = '#3B82F6';
      radius = 16;
    } else if (district.risk?.drought) {
      color = '#F97316';
      radius = 16;
    } else {
      color = '#9CA3AF';
      radius = 6;
    }
  } else if (layerType === 'suitability') {
    const score = district.suitability?.score ?? 50;
    radius = 12;
    color = score > 80 ? '#059669' : score > 50 ? '#D97706' : '#DC2626';
  }

  return { color, radius, className, iconHtml: '' };
}
