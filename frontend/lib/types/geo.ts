// Geographic hierarchy types for Sri Lanka

export interface DSD {
  id: string;
  name: string;
  type: 'DSD';
}

export interface District {
  id: string;
  name: string;
  coords: [number, number]; // [lat, lng]
  provinceId: string;
  dsds?: Record<string, DSD>;
}

export interface Province {
  id: string;
  name: string;
  coords: [number, number]; // [lat, lng]
  districts: Record<string, District>;
}

export interface SriLankaHierarchy {
  [provinceId: string]: Province;
}

// GeoJSON Feature for mapping
export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat] for GeoJSON convention
  };
  properties: {
    id: string;
    name: string;
    level: 'province' | 'district' | 'dsd';
    parentId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any; // DistrictData - deferred to avoid circular import
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
