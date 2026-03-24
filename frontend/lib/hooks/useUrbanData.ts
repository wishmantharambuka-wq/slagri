// useUrbanData - Custom hook for fetching urban/spatial data from FastAPI backend
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DistrictData } from '@/lib/types/crops';
import { LayerType } from '@/lib/types/map';
import { mapApi } from '@/lib/api/map';
import { flattenDistricts, getDistrictByName } from '@/lib/constants/sri-lanka';

// Helper to generate mock district data (fallback when API unavailable)
function generateMockDistrictData(crop: string, horizon: number): DistrictData[] {
  const districts = flattenDistricts();
  const majorDistricts = ['Polonnaruwa', 'Ampara', 'Anuradhapura', 'Kurunegala', 'Hambantota', 'Nuwara Eliya', 'Badulla'];

  return districts.map((d) => {
    const isMajor = majorDistricts.includes(d.name) && crop === 'Paddy';

    const cultivatedArea = isMajor
      ? Math.floor(Math.random() * 50000 + 20000)
      : Math.floor(Math.random() * 5000 + 1000);
    const yieldPerHa = 4 + Math.random() * 2;

    // Forecast trend factor
    let trendFactor = 1.0;
    if (horizon === 1) trendFactor = 1.1;
    else if (horizon === 2) trendFactor = 1.3;
    else if (horizon === 3) trendFactor = 0.8;

    const noise = Math.random() * 0.4 - 0.2;
    const harvest = Math.floor(cultivatedArea * yieldPerHa * (trendFactor + noise));
    const consumption = Math.floor(Math.random() * 20000 + 5000);
    const surplus = harvest - consumption;

    const status = surplus > 5000 ? 'surplus' : surplus < -2000 ? 'shortage' : 'balanced';

    const soils = ['Reddish Brown', 'Alluvial', 'Sandy', 'Clay'];
    const soil = soils[Math.floor(Math.random() * soils.length)];

    return {
      name: d.name,
      coords: d.coords,
      cultivatedArea,
      harvest,
      consumption,
      surplus,
      status,
      risk: {
        flood: Math.random() > 0.8,
        drought: Math.random() > 0.8,
        score: Math.floor(Math.random() * 100),
      },
      suitability: {
        soil,
        water: Math.floor(Math.random() * 100),
        elevation: Math.floor(Math.random() * 2000),
        score: Math.floor(Math.random() * 50 + 50),
      },
      price: {
        current: Math.floor(Math.random() * 100 + 50),
        trend: Math.random() > 0.5 ? 'up' : 'down',
      },
    };
  });
}

interface UseUrbanDataOptions {
  crop: string;
  horizon: number;
  layer: LayerType;
  enabled?: boolean;
}

interface UseUrbanDataReturn {
  data: DistrictData[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  forecastData: DistrictData[] | null;
  isForecastLoading: boolean;
}

export function useUrbanData({
  crop,
  horizon,
  layer,
  enabled = true,
}: UseUrbanDataOptions): UseUrbanDataReturn {
  const [data, setData] = useState<DistrictData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [forecastData, setForecastData] = useState<DistrictData[] | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState(false);

  // Cache ref to avoid redundant fetches
  const cacheRef = useRef<Map<string, DistrictData[]>>(new Map());

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    const cacheKey = `${crop}-${horizon}`;

    // Return cached data if available
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      setData(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from API
      let result = await mapApi.getAggregates(crop);

      // Enrich with local coordinates if API doesn't provide them
      result = result.map((d: DistrictData) => {
        const localData = getDistrictByName(d.name);
        return {
          ...d,
          coords: d.coords || localData?.coords || [7.8731, 80.7718],
          risk: d.risk || {
            flood: Math.random() > 0.8,
            drought: Math.random() > 0.8,
            score: Math.floor(Math.random() * 100),
          },
          suitability: d.suitability || {
            soil: 'Alluvial',
            water: Math.floor(Math.random() * 100),
            elevation: Math.floor(Math.random() * 2000),
            score: Math.floor(Math.random() * 50 + 50),
          },
          price: d.price || {
            current: Math.floor(Math.random() * 100 + 50),
            trend: Math.random() > 0.5 ? 'up' : 'down',
          },
        };
      });

      setData(result);
      cacheRef.current.set(cacheKey, result);
    } catch (err) {
      // Fallback to mock data
      console.warn('API unavailable, using mock data:', err);
      const mockData = generateMockDistrictData(crop, horizon);
      setData(mockData);
      cacheRef.current.set(cacheKey, mockData);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [crop, horizon, enabled]);

  const fetchForecast = useCallback(async () => {
    if (!enabled || horizon === 0) {
      setForecastData(null);
      return;
    }

    const cacheKey = `forecast-${crop}-${horizon}`;

    if (cacheRef.current.has(cacheKey)) {
      setForecastData(cacheRef.current.get(cacheKey)!);
      return;
    }

    setIsForecastLoading(true);
    try {
      const result = await mapApi.getForecast(crop, horizon);
      setForecastData(result);
      cacheRef.current.set(cacheKey, result);
    } catch {
      setForecastData(null);
    } finally {
      setIsForecastLoading(false);
    }
  }, [crop, horizon, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const refresh = useCallback(async () => {
    cacheRef.current.clear();
    await fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    forecastData,
    isForecastLoading,
  };
}
