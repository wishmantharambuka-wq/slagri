// Crop and market data types

export type MarketStatus = 'surplus' | 'shortage' | 'balanced' | 'stable';

export interface CropData {
  cultivatedArea: number; // hectares
  harvest: number; // MT
  consumption: number; // MT
  surplus: number; // MT (positive = surplus, negative = shortage)
  status: MarketStatus;
}

export interface PriceData {
  current: number; // LKR/kg
  trend: 'up' | 'down' | 'stable';
  trendPercent?: string; // e.g. "+4.2%"
}

export interface ClimateRisk {
  flood: boolean;
  drought: boolean;
  score: number; // 0-100
}

export interface LandSuitability {
  soil: string; // e.g. "Reddish Brown", "Alluvial"
  water: number; // 0-100 percentage
  elevation: number; // meters
  score: number; // 0-100
}

export interface DistrictData extends CropData {
  name: string;
  coords: [number, number];
  risk: ClimateRisk;
  suitability: LandSuitability;
  price: PriceData;
}

// AI-generated insight
export interface AIInsight {
  horizon: 0 | 1 | 2 | 3; // 0=now, 1=+1M, 2=+2M, 3=+3M
  summary: string;
  recommendations: string[];
  riskFactors: string[];
}

// 26 crop types in Sri Lanka
export const CROP_TYPES = [
  'Paddy',
  'Maize',
  'Tea',
  'Rubber',
  'Coconut',
  'Vegetables',
  'Fruits',
  'Spices',
  'Cinnamon',
  'Pepper',
  'Cardamom',
  'Cloves',
  'Sugarcane',
  'Cashew',
  'Betel',
  'Arecanut',
  'Manioc',
  'Potato',
  'Big Onion',
  'Red Onion',
  'Chili',
  'Green Gram',
  'Cowpea',
  'Soybean',
  'Kurakkan',
  'Gingelly',
] as const;

export type CropType = (typeof CROP_TYPES)[number];
