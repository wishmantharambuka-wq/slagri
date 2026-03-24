// Map API endpoints
import { apiClient } from './client';
import { DistrictData } from '@/lib/types/crops';
import { DistrictAggregate, ForecastResponse } from '@/lib/types/api';

export const mapApi = {
  // Get district aggregates for a crop
  getAggregates: async (crop?: string): Promise<DistrictData[]> => {
    const query = crop ? `?crop=${encodeURIComponent(crop)}` : '';
    return apiClient.get<DistrictData[]>(`/map/aggregates${query}`, true);
  },

  // Get all districts with submission counts
  getDistricts: async () => {
    return apiClient.get<DistrictAggregate[]>('/map/districts', true);
  },

  // Get forecast data for a crop at a horizon
  getForecast: async (crop: string, horizon: number): Promise<DistrictData[]> => {
    const query = `?crop=${encodeURIComponent(crop)}&horizon=${horizon}`;
    // API returns ForecastResponse which extends DistrictAggregate
    // We cast to DistrictData[] as the response structure is compatible
    return apiClient.get<ForecastResponse[]>(`/map/forecast${query}`, true) as unknown as Promise<DistrictData[]>;
  },

  // Get available crop types
  getCrops: async (): Promise<string[]> => {
    return apiClient.get<string[]>('/map/crops', true);
  },
};
